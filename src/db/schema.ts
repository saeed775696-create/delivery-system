import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  jsonb,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* =========================
   ENUMS
========================= */

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "driver",
  "vendor",
  "admin",
]);

export const vehicleTypeEnum = pgEnum("vehicle_type", ["motorcycle", "car"]);

export const storeCategoryEnum = pgEnum("store_category", [
  "food",
  "pharmacy",
  "grocery",
  "restaurant",
  "bakery",
  "other",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "accepted",
  "preparing",
  "picked_up",
  "on_way",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash_on_delivery",
  "wallet",
  "bank_transfer",
]);

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 15 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  isActive: boolean("is_active").default(true),
  fcmToken: text("fcm_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================
   CUSTOMER DETAILS
========================= */

export const customerDetails = pgTable("customer_details", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  savedAddresses: jsonb("saved_addresses"),
  defaultAddressId: varchar("default_address_id", { length: 50 }),
});

/* =========================
   DRIVERS
========================= */

export const drivers = pgTable("drivers", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  vehicleType: vehicleTypeEnum("vehicle_type").default("motorcycle"),
  isAvailable: boolean("is_available").default(true),

  currentLat: decimal("current_lat", { precision: 10, scale: 7 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 7 }),

  totalBalance: decimal("total_balance", { precision: 10, scale: 2 }).default(
    "0",
  ),
  ratingAvg: decimal("rating_avg", { precision: 2, scale: 1 }).default("5.0"),
  totalDeliveries: integer("total_deliveries").default(0),
});

/* =========================
   STORES
========================= */

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),

  ownerId: uuid("owner_id").references(() => users.id, {
    onDelete: "cascade",
  }),

  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),

  description: text("description"),

  category: storeCategoryEnum("category").notNull().default("food"),

  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),

  addressDescription: text("address_description"),

  commissionRate: decimal("commission_rate", {
    precision: 5,
    scale: 2,
  }).default("10"),

  isOpen: boolean("is_open").default(true),

  workingHours: jsonb("working_hours"),

  imageUrl: text("image_url"),
  phone: varchar("phone", { length: 15 }),

  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalOrders: integer("total_orders").default(0),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   PRODUCTS
========================= */

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),

  storeId: uuid("store_id")
    .references(() => stores.id, { onDelete: "cascade" })
    .notNull(),

  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),

  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),

  imageUrl: text("image_url"),

  isAvailable: boolean("is_available").default(true),
  preparationTime: integer("preparation_time").default(15),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   ORDERS
========================= */

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: serial("order_number"),

  customerId: uuid("customer_id")
    .references(() => users.id)
    .notNull(),

  storeId: uuid("store_id")
    .references(() => stores.id)
    .notNull(),

  driverId: uuid("driver_id").references(() => users.id),

  status: orderStatusEnum("status").default("pending"),

  items: jsonb("items").notNull(),

  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 8, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),

  paymentMethod:
    paymentMethodEnum("payment_method").default("cash_on_delivery"),

  deliveryAddress: jsonb("delivery_address"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   ORDER STATUS LOG (FIXED)
========================= */

export const orderStatusLog = pgTable("order_status_log", {
  id: serial("id").primaryKey(),

  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),

  status: orderStatusEnum("status").notNull(),
  note: text("note"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   SETTINGS
========================= */

export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
});

/* =========================
   RELATIONS (optional)
========================= */

export const usersRelations = relations(users, ({ one }) => ({
  customerDetails: one(customerDetails),
  driver: one(drivers),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores),
  customer: one(users),
  driver: one(users),
  logs: many(orderStatusLog),
}));
