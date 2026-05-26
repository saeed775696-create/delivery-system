import { db } from "@/db";
import { orders, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { eventBus } from "@/socket/events";
import { canTransition } from "@/modules/orders/order.state";
import { OrderEvent } from "@/modules/orders/order.events";
import { ORDER_STATUS } from "@/modules/orders/order.constants";

// ========================
// ✅ TYPES (FIXED)
// ========================

type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

type PaymentMethod = any; // (لو عندك enum لاحقاً نصلحه)

type CreateOrderInput = {
  customerId: string;
  storeId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  deliveryAddress: {
    address: string;
    lat?: number;
    lng?: number;
    notes?: string;
  };
  paymentMethod: PaymentMethod;
};

// ========================
// ✅ EVENT MAP (FIXED)
// ========================

const eventMap: Record<OrderStatus, OrderEvent> = {
  pending: "order_pending",
  accepted: "order_accepted",
  preparing: "order_preparing",
  picked_up: "order_picked_up",
  on_way: "order_on_way",
  delivered: "order_delivered",
  cancelled: "order_cancelled",
};

// ========================
// SERVICE
// ========================

export class OrderService {
  static async create(data: CreateOrderInput) {
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee = 500;
    const total = subtotal + deliveryFee;

    const [order] = await db
      .insert(orders)
      .values({
        customerId: data.customerId,
        storeId: data.storeId,
        items: data.items,

        deliveryAddress: {
          address: data.deliveryAddress.address,
          lat: data.deliveryAddress.lat ?? 0,
          lng: data.deliveryAddress.lng ?? 0,
          notes: data.deliveryAddress.notes,
        },

        paymentMethod: data.paymentMethod,

        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),

        status: ORDER_STATUS.PENDING,
      })
      .returning();

    eventBus.emit("order_created", order);

    return order;
  }

  static async findById(id: string) {
    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        subtotal: orders.subtotal,
        deliveryFee: orders.deliveryFee,
        total: orders.total,
        createdAt: orders.createdAt,
        deliveryAddress: orders.deliveryAddress,
        items: orders.items,
        storeName: stores.nameAr,
      })
      .from(orders)
      .leftJoin(stores, eq(orders.storeId, stores.id))
      .where(eq(orders.id, id))
      .limit(1);

    return order ?? null;
  }

  static async findByDriver(driverId: string) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.driverId, driverId))
      .orderBy(desc(orders.createdAt));
  }

  static async getAvailableOrders() {
    return db
      .select()
      .from(orders)
      .where(eq(orders.status, ORDER_STATUS.PENDING))
      .orderBy(desc(orders.createdAt));
  }

  static async updateStatus(id: string, status: OrderStatus) {
    const [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

   if (!current) {
     throw new Error("ORDER_NOT_FOUND");
   }

   if (!current.status) {
     throw new Error("ORDER_STATUS_NOT_FOUND");
   }

   if (!canTransition(current.status, status)) {
     throw new Error(
       `INVALID_STATUS_TRANSITION: ${current.status} → ${status}`,
     );
   }

    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    const event = eventMap[status];

    if (event) {
      eventBus.emit(event, order);
    }

    return order;
  }

  static async assignDriver(orderId: string, driverId: string) {
    const existingOrder = await this.findById(orderId);

    if (!existingOrder) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (existingOrder.status !== ORDER_STATUS.PENDING) {
      throw new Error("ORDER_ALREADY_ASSIGNED");
    }

    const [order] = await db
      .update(orders)
      .set({
        driverId,
        status: ORDER_STATUS.ACCEPTED,
      })
      .where(eq(orders.id, orderId))
      .returning();

    eventBus.emit("order_accepted", order);

    return order;
  }
}