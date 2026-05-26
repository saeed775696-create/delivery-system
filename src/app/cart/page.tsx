"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  Check,
  Store,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Cart {
  storeId: string | null;
  storeName: string | null;
  items: CartItem[];
}

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart>({
    storeId: null,
    storeName: null,
    items: [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState({
    address: "",
    lat: 13.5789,
    lng: 44.0219,
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("cash_on_delivery");

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart: Cart) => {
    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );
  };

  const updateQuantity = (
    productId: string,
    delta: number
  ) => {
    const updatedCart = { ...cart };

    const itemIndex = updatedCart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) return;

    updatedCart.items[itemIndex].quantity += delta;

    if (
      updatedCart.items[itemIndex].quantity <= 0
    ) {
      updatedCart.items.splice(itemIndex, 1);
    }

    if (updatedCart.items.length === 0) {
      updatedCart.storeId = null;
      updatedCart.storeName = null;
    }

    saveCart(updatedCart);
  };

  const clearCart = () => {
    const emptyCart = {
      storeId: null,
      storeName: null,
      items: [],
    };

    saveCart(emptyCart);
  };

  const subtotal = cart.items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 500;

  const total = subtotal + deliveryFee;

  const handleOrder = async () => {
    if (!address.address.trim()) {
      alert("يرجى إدخال عنوان التوصيل");
      return;
    }

    if (
      !cart.storeId ||
      cart.items.length === 0
    ) {
      alert("السلة فارغة");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          storeId: cart.storeId,
          items: cart.items,
          deliveryAddress: address,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "حدث خطأ أثناء إنشاء الطلب"
        );
      }

      clearCart();

      router.push(
        `/orders/${data.order.id}`
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Empty Cart
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/stores"
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <ArrowRight className="w-6 h-6 text-slate-600" />
              </Link>

              <h1 className="font-bold text-slate-800">
                السلة
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <ShoppingCart className="w-20 h-20 mx-auto mb-5 text-slate-300" />

            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              السلة فارغة
            </h2>

            <p className="text-slate-500 mb-6">
              أضف منتجات من المتاجر
              للمتابعة
            </p>

            <Link
              href="/stores"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
            >
              <Store className="w-5 h-5" />
              تصفح المتاجر
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/stores"
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <ArrowRight className="w-6 h-6 text-slate-600" />
              </Link>

              <div>
                <h1 className="font-bold text-slate-800">
                  السلة
                </h1>

                <p className="text-sm text-slate-500">
                  {cart.storeName}
                </p>
              </div>
            </div>

            <button
              onClick={clearCart}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Items */}
        <Card>
          <h2 className="font-bold text-slate-800 mb-5">
            المنتجات ({cart.items.length})
          </h2>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">
                    {item.name}
                  </h3>

                  <p className="text-emerald-600 font-semibold mt-1">
                    {item.price.toLocaleString()}{" "}
                    ر.ي
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        -1
                      )
                    }
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-6 text-center font-bold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        1
                      )
                    }
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Address */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-600" />

            <h2 className="font-bold text-slate-800">
              عنوان التوصيل
            </h2>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="اكتب عنوان التوصيل..."
              value={address.address}
              onChange={(e) =>
                setAddress({
                  ...address,
                  address:
                    e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />

            <textarea
              rows={3}
              placeholder="ملاحظات إضافية..."
              value={address.notes}
              onChange={(e) =>
                setAddress({
                  ...address,
                  notes: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>
        </Card>

        {/* Payment */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-emerald-600" />

            <h2 className="font-bold text-slate-800">
              طريقة الدفع
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                value:
                  "cash_on_delivery",
                label:
                  "الدفع عند الاستلام",
                icon: "💵",
              },
              {
                value: "wallet",
                label:
                  "محفظة إلكترونية",
                icon: "📱",
              },
            ].map((method) => (
              <label
                key={method.value}
                className={`
                  flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition
                  ${
                    paymentMethod ===
                    method.value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }
                `}
              >
                <input
                  type="radio"
                  className="hidden"
                  value={method.value}
                  checked={
                    paymentMethod ===
                    method.value
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                />

                <span className="text-2xl">
                  {method.icon}
                </span>

                <span className="font-medium text-slate-700">
                  {method.label}
                </span>

                {paymentMethod ===
                  method.value && (
                  <Check className="w-5 h-5 text-emerald-600 mr-auto" />
                )}
              </label>
            ))}
          </div>
        </Card>

        {/* Summary */}
        <Card>
          <h2 className="font-bold text-slate-800 mb-4">
            ملخص الطلب
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>
                المجموع الجزئي
              </span>

              <span>
                {subtotal.toLocaleString()}{" "}
                ر.ي
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>
                رسوم التوصيل
              </span>

              <span>
                {deliveryFee.toLocaleString()}{" "}
                ر.ي
              </span>
            </div>

            <div className="flex justify-between pt-4 border-t text-lg font-bold">
              <span>الإجمالي</span>

              <span className="text-emerald-600">
                {total.toLocaleString()}{" "}
                ر.ي
              </span>
            </div>
          </div>
        </Card>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="container mx-auto">
          <Button
            onClick={handleOrder}
            isLoading={isLoading}
            disabled={!address.address}
            className="w-full py-4 text-lg font-bold"
          >
            تأكيد الطلب (
            {total.toLocaleString()} ر.ي)
          </Button>
        </div>
      </div>
    </div>
  );
}