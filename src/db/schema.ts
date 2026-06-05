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


export const customerDetails = pgTable("customer_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // واحد لواحد
  savedAddresses: jsonb("saved_addresses").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  vehicleType: vehicleTypeEnum("vehicle_type").default("motorcycle"),
  isAvailable: boolean("is_available").default(false),
  licenseNumber: varchar("license_number", { length: 50 }),
  // 🆕 الأعمدة الجديدة
  currentLat: decimal("current_lat", { precision: 10, scale: 7 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 7 }),
  ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).default("5.0"),
  totalDeliveries: integer("total_deliveries").default(0),
  totalBalance: decimal("total_balance", { precision: 12, scale: 2 }).default("0"),
  lastActive: timestamp("last_active", { withTimezone: true }),

  createdAt: timestamp("created_at").defaultNow(),
});

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

  category: storeCategoryEnum("category").default("food"),

  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),

  addressDescription: text("address_description"),

  commissionRate: decimal("commission_rate", {
    precision: 5,
    scale: 2,
  }).default("10"),

  isOpen: boolean("is_open").default(true),

  imageUrl: text("image_url"),
  phone: varchar("phone", { length: 15 }),

  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalOrders: integer("total_orders").default(0),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   STORE SECTIONS (MENU CATEGORIES)
========================= */

export const storeSections = pgTable("store_sections", {
  id: uuid("id").defaultRandom().primaryKey(),

  storeId: uuid("store_id")
    .references(() => stores.id, { onDelete: "cascade" })
    .notNull(),

  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),

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

  categoryId: uuid("category_id").references(() => storeSections.id),

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
   PAYMENTS (ONLY ONE)
========================= */

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  method: varchar("method", { length: 50 }).notNull(),

  status: varchar("status", { length: 50 }).default("PENDING"),

  referenceNumber: varchar("reference_number", { length: 100 }),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   NOTIFICATIONS (ONLY ONE)
========================= */

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),

  isRead: boolean("is_read").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});


/* =========================
   RELATIONS
========================= */

export const usersRelations = relations(users, ({ one }) => ({
  customerDetail: one(customerDetails, {
    fields: [users.id],
    references: [customerDetails.userId],
  }),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  // يمكنك إضافة store إذا كان فيندور (علاقة one-to-one مع stores عبر ownerId)
  // store: one(stores, { fields: [users.id], references: [stores.ownerId] })
}));

export const customerDetailsRelations = relations(customerDetails, ({ one }) => ({
  user: one(users, {
    fields: [customerDetails.userId],
    references: [users.id],
  }),
}));

export const driversRelations = relations(drivers, ({ one }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
  }),
}));

// يمكنك أيضاً إضافة علاقة stores مع owner (المستخدم)
export const storesRelations = relations(stores, ({ one }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
}));