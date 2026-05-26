import "dotenv/config";
import { db } from "../src/db";
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
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (safe order)
  await db.delete(orderStatusLog);
  await db.delete(orders);
  await db.delete(products);
  await db.delete(stores);
  await db.delete(drivers);
  await db.delete(customerDetails);
  await db.delete(users);
  await db.delete(settings);

  // Admin
  const adminPassword = await hashPassword("admin123");
  const [admin] = await db
    .insert(users)
    .values({
      phone: "777000000",
      password: adminPassword,
      fullName: "مدير النظام",
      role: "admin",
      isActive: true,
    })
    .returning();

  console.log("✅ Admin created");

  // Customer
  const customerPassword = await hashPassword("customer123");
  const [customer] = await db
    .insert(users)
    .values({
      phone: "777111111",
      password: customerPassword,
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

  // Driver
  const driverPassword = await hashPassword("driver123");
  const [driver] = await db
    .insert(users)
    .values({
      phone: "777222222",
      password: driverPassword,
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

  // Vendor
  const vendorPassword = await hashPassword("vendor123");
  const [vendor] = await db
    .insert(users)
    .values({
      phone: "777333333",
      password: vendorPassword,
      fullName: "مطعم البركة",
      role: "vendor",
      isActive: true,
    })
    .returning();

  // Store
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

  // Products
  const storeProducts = [
    { nameAr: "برجر لحم", price: "1500", preparationTime: 15 },
    { nameAr: "برجر دجاج", price: "1200", preparationTime: 12 },
    { nameAr: "بطاطس", price: "500", preparationTime: 8 },
    { nameAr: "كولا", price: "300", preparationTime: 2 },
    { nameAr: "عصير", price: "600", preparationTime: 5 },
  ];

  for (const product of storeProducts) {
    await db.insert(products).values({
      storeId: store.id,
      ...product,
      isAvailable: true,
    });
  }

  // Sample order
  const [sampleOrder] = await db
    .insert(orders)
    .values({
      customerId: customer.id,
      storeId: store.id,
      driverId: driver.id,
      status: "delivered",
      items: [
        { productId: "1", name: "برجر", quantity: 2, price: 1500 },
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

  // ✅ FIXED: Drizzle updates
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

  // Settings
  await db.insert(settings).values([
    { key: "delivery_fee", value: "500" },
    { key: "commission", value: "10" },
  ]);

  console.log("🎉 Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => process.exit(0));