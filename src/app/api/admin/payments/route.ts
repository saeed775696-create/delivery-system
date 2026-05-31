import { db } from '@/db';
import { payments, orders } from '@/db/schema';

export async function GET() {
  const data = await db
    .select()
    .from(payments);

  return Response.json(data);
}
