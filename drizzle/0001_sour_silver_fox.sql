CREATE TABLE "store_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"name_ar" varchar(100) NOT NULL,
	"name_en" varchar(100),
	"image_url" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "customer_details" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "drivers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_status_log" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ratings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "wallet_transactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "customer_details" CASCADE;--> statement-breakpoint
DROP TABLE "drivers" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "order_status_log" CASCADE;--> statement-breakpoint
DROP TABLE "ratings" CASCADE;--> statement-breakpoint
DROP TABLE "settings" CASCADE;--> statement-breakpoint
DROP TABLE "wallet_transactions" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_store_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."store_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "cash_collected";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "wallet_transaction_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "wallet_verified";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "delivery_address";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "customer_notes";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "estimated_distance_meters";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "estimated_delivery_time";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "accepted_at";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "picked_up_at";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "delivered_at";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "cancelled_at";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "cancellation_reason";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category";