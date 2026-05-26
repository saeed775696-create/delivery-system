import { db } from "../src/db";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

async function migrate() {
  console.log("🗄️  Running database migration...");

  try {
    await db.execute(sql`select 1`);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  console.log("\n💡 Run migrations using drizzle-kit:");
  console.log("  npx drizzle-kit push    - Push schema to database");
  console.log("  npx drizzle-kit generate - Generate migration files");
  console.log("  npx drizzle-kit migrate  - Run migrations");
}

migrate()
  .catch((e) => {
    console.error("Migration check failed:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
