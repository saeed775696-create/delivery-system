import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// تفعيل قراءة ملف الـ .env
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
