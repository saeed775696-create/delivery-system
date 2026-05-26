import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "vendor") {
    redirect("/login");
  }

  const { id } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  if (!product) {
    notFound();
  }

  async function updateProduct(formData: FormData) {
    "use server";

    const nameAr = formData.get("nameAr") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;

    await db
      .update(products)
      .set({
        nameAr,
        price,
        description,
      })
      .where(eq(products.id, id));

    redirect("/vendor/products");
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        تعديل المنتج
      </h1>

      <form action={updateProduct} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">
            اسم المنتج
          </label>

          <input
            type="text"
            name="nameAr"
            defaultValue={product.nameAr || ""}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            السعر
          </label>

          <input
            type="text"
            name="price"
            defaultValue={product.price || ""}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            الوصف
          </label>

          <textarea
            name="description"
            defaultValue={product.description || ""}
            className="w-full border rounded-xl px-4 py-3 h-32"
          />
        </div>

        <button
          type="submit"
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl"
        >
          حفظ التعديلات
        </button>
      </form>
    </div>
  );
}