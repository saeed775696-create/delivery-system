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

// Enums
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

// Users table
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

// Customer details
export const customerDetails = pgTable("customer_details", {
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  savedAddresses: jsonb("saved_addresses").$type<
    Array<{
      id: string;
      label: string;
      address: string;
      lat: number;
      lng: number;
    }>
  >(),
  defaultAddressId: varchar("default_address_id", { length: 50 }),
});

// Drivers table
export const drivers = pgTable("drivers", {
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),

  vehicleType: vehicleTypeEnum("vehicle_type").default("motorcycle"),

  isAvailable: boolean("is_available").default(true),

  // ✅ الموقع الحالي (صح)
  currentLat: decimal("current_lat", { precision: 10, scale: 7 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 7 }),

  // 🟡 إضافة مهمة (آخر تحديث موقع)
  lastLat: decimal("last_lat", { precision: 10, scale: 7 }),
  lastLng: decimal("last_lng", { precision: 10, scale: 7 }),

  totalBalance: decimal("total_balance", { precision: 10, scale: 2 }).default("0"),

  ratingAvg: decimal("rating_avg", { precision: 2, scale: 1 }).default("5.0"),

  totalDeliveries: integer("total_deliveries").default(0),

  lastActive: timestamp("last_active"),
});

// Stores table
export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  description: text("description"),
  category: storeCategoryEnum("category").notNull().default("food"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  addressDescription: text("address_description"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default(
    "10"
  ),
  isOpen: boolean("is_open").default(true),
  workingHours: jsonb("working_hours").$type<{
    open: string;
    close: string;
    daysOff: number[];
  }>(),
  imageUrl: text("image_url"),
  phone: varchar("phone", { length: 15 }),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalOrders: integer("total_orders").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
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
  category: varchar("category", { length: 50 }),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  preparationTime: integer("preparation_time").default(15), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
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
  items: jsonb("items")
    .$type<
      Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
        notes?: string;
      }>
    >()
    .notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 8, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("cash_on_delivery"),
  cashCollected: boolean("cash_collected").default(false),
  walletTransactionId: varchar("wallet_transaction_id", { length: 100 }),
  walletVerified: boolean("wallet_verified").default(false),
  deliveryAddress: jsonb("delivery_address").$type<{
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  }>(),
  customerNotes: text("customer_notes"),
  estimatedDistanceMeters: integer("estimated_distance_meters"),
  estimatedDeliveryTime: integer("estimated_delivery_time"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
});

// Order status log
export const orderStatusLog = pgTable("order_status_log", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  status: orderStatusEnum("status").notNull(),
  driverLat: decimal("driver_lat", { precision: 10, scale: 7 }),
  driverLng: decimal("driver_lng", { precision: 10, scale: 7 }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => users.id)
    .notNull(),
  storeRating: integer("store_rating"),
  driverRating: integer("driver_rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type", { length: 20 }).notNull(), // 'credit', 'debit', 'withdrawal'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  type: varchar("type", { length: 50 }),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings table
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  customerDetails: one(customerDetails, {
    fields: [users.id],
    references: [customerDetails.userId],
  }),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
  stores: many(stores),
  customerOrders: many(orders, { relationName: "customerOrders" }),
  driverOrders: many(orders, { relationName: "driverOrders" }),
  notifications: many(notifications),
  walletTransactions: many(walletTransactions),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  products: many(products),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
    relationName: "customerOrders",
  }),
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
    relationName: "driverOrders",
  }),
  statusLogs: many(orderStatusLog),
  rating: one(ratings, {
    fields: [orders.id],
    references: [ratings.orderId],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
