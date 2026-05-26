import { z } from "zod";

// User validations
export const registerSchema = z.object({
  phone: z
    .string()
    .min(9, "رقم الهاتف يجب أن يكون 9 أرقام على الأقل")
    .max(15, "رقم الهاتف طويل جداً")
    .regex(/^[0-9+]+$/, "رقم الهاتف غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  role: z.enum(["customer", "driver", "vendor"]).optional().default("customer"),
});

export const loginSchema = z.object({
  phone: z.string().min(9, "رقم الهاتف مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// Store validations
export const storeSchema = z.object({
  nameAr: z.string().min(2, "اسم المتجر مطلوب"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["food", "pharmacy", "grocery", "restaurant", "bakery", "other"]),
  lat: z.number().optional(),
  lng: z.number().optional(),
  addressDescription: z.string().optional(),
  phone: z.string().optional(),
});

// Product validations
export const productSchema = z.object({
  nameAr: z.string().min(2, "اسم المنتج مطلوب"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  discountPrice: z.number().positive().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional().default(true),
  preparationTime: z.number().int().positive().optional().default(15),
});

// Order validations
export const createOrderSchema = z.object({
  storeId: z.string().uuid("معرف المتجر غير صالح"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        notes: z.string().optional(),
      })
    )
    .min(1, "يجب إضافة منتج واحد على الأقل"),
  deliveryAddress: z.object({
    address: z.string().min(1, "العنوان مطلوب"),
    lat: z.number(),
    lng: z.number(),
    notes: z.string().optional(),
  }),
  paymentMethod: z.enum(["cash_on_delivery", "wallet", "bank_transfer"]).optional(),
  customerNotes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "accepted",
    "preparing",
    "picked_up",
    "on_way",
    "delivered",
    "cancelled",
  ]),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

// Driver location update
export const updateLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type StoreInput = z.infer<typeof storeSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
