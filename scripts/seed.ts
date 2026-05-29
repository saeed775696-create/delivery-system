import "dotenv/config";
import { db } from "../src/db";
import { sql, eq } from "drizzle-orm";
import {
  users,
  customerDetails,
  drivers,
  stores,
  products,
  orders,
  orderStatusLog,
  settings,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

async function seed() {
  console.log("🌱 Seeding database...");

  // =========================
  // RESET DATABASE (SAFE)
  // =========================
  await db.execute(sql`TRUNCATE TABLE 
    order_status_log,
    orders,
    products,
    stores,
    drivers,
    customer_details,
    users,
    settings
    RESTART IDENTITY CASCADE;
  `);

  // =====================
  // ADMIN
  // =====================
  const [admin] = await db
    .insert(users)
    .values({
      phone: "777000000",
      password: await hashPassword("admin123"),
      fullName: "مدير النظام",
      role: "admin",
      isActive: true,
    })
    .returning();

  console.log("✅ Admin created");

  // =====================
  // CUSTOMER
  // =====================
  const [customer] = await db
    .insert(users)
    .values({
      phone: "777111111",
      password: await hashPassword("customer123"),
      fullName: "أحمد محمد",
      role: "customer",
      isActive: true,
    })
    .returning();

  await db.insert(customerDetails).values({
    userId: customer.id,
    savedAddresses: [
      {
        id: "1",
        label: "المنزل",
        address: "شارع التحرير، تعز",
        lat: 13.5789,
        lng: 44.0219,
      },
    ],
    defaultAddressId: "1",
  });

  // =====================
  // DRIVER
  // =====================
  const [driver] = await db
    .insert(users)
    .values({
      phone: "777222222",
      password: await hashPassword("driver123"),
      fullName: "خالد علي",
      role: "driver",
      isActive: true,
    })
    .returning();

  await db.insert(drivers).values({
    userId: driver.id,
    vehicleType: "motorcycle",
    isAvailable: true,
    currentLat: "13.5800",
    currentLng: "44.0220",
    totalBalance: "0",
    ratingAvg: "5.0",
    totalDeliveries: 0,
  });

  // =====================
  // VENDOR
  // =====================
  const [vendor] = await db
    .insert(users)
    .values({
      phone: "777333333",
      password: await hashPassword("vendor123"),
      fullName: "مطعم البركة",
      role: "vendor",
      isActive: true,
    })
    .returning();

  // =====================
  // STORE
  // =====================
  const [store] = await db
    .insert(stores)
    .values({
      ownerId: vendor.id,
      nameAr: "مطعم البركة",
      nameEn: "Al Baraka Restaurant",
      description: "مطعم يقدم أشهى المأكولات العربية والشرقية",
      category: "restaurant",
      lat: "13.5790",
      lng: "44.0215",
      addressDescription: "شارع جمال، مقابل المستشفى الجمهوري",
      commissionRate: "10",
      isOpen: true,
      workingHours: { open: "08:00", close: "23:00", daysOff: [] },
      phone: "777333333",
      rating: "4.5",
      totalOrders: 0,
    })
    .returning();

  // =====================
  // PRODUCTS
  // =====================
  const insertedProducts = await db
    .insert(products)
    .values([
      {
        storeId: store.id,
        nameAr: "برجر لحم",
        price: "1500",
        preparationTime: 15,
        isAvailable: true,
      },
      {
        storeId: store.id,
        nameAr: "برجر دجاج",
        price: "1200",
        preparationTime: 12,
        isAvailable: true,
      },
      {
        storeId: store.id,
        nameAr: "بطاطس",
        price: "500",
        preparationTime: 8,
        isAvailable: true,
      },
      {
        storeId: store.id,
        nameAr: "كولا",
        price: "300",
        preparationTime: 2,
        isAvailable: true,
      },
      {
        storeId: store.id,
        nameAr: "عصير",
        price: "600",
        preparationTime: 5,
        isAvailable: true,
      },
    ])
    .returning();

  // =====================
  // SAMPLE ORDER
  // =====================
  const [sampleOrder] = await db
    .insert(orders)
    .values({
      customerId: customer.id,
      storeId: store.id,
      driverId: driver.id,
      status: "delivered",
      items: [
        {
          productId: insertedProducts[0].id,
          name: insertedProducts[0].nameAr,
          quantity: 2,
          price: Number(insertedProducts[0].price),
        },
      ],
      subtotal: "3000",
      deliveryFee: "500",
      total: "3500",
      paymentMethod: "cash_on_delivery",
      cashCollected: true,
      deliveryAddress: {
        address: "شارع التحرير، تعز",
        lat: 13.5789,
        lng: 44.0219,
      },
      createdAt: new Date(),
    })
    .returning();

  await db.insert(orderStatusLog).values([
    { orderId: sampleOrder.id, status: "pending", note: "تم الإنشاء" },
    { orderId: sampleOrder.id, status: "delivered", note: "تم التوصيل" },
  ]);

  // =====================
  // UPDATE STATS
  // =====================
  await db
    .update(stores)
    .set({ totalOrders: 1 })
    .where(eq(stores.id, store.id));

  await db
    .update(drivers)
    .set({
      totalDeliveries: 1,
      totalBalance: "500",
    })
    .where(eq(drivers.userId, driver.id));

  // =====================
  // SETTINGS
  // =====================
  await db.insert(settings).values([
    { key: "delivery_fee", value: "500" },
    { key: "commission", value: "10" },
  ]);

  console.log("🎉 Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
