import "dotenv/config";
import { db } from "@/db";
import { users } from "@/db/schema";

async function test() {
  try {
    const result = await db.select().from(users).limit(1);

    console.log("✅ Database Connected Successfully");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
  }
}

test();
