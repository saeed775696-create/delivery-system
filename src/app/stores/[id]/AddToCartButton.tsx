"use client";

import { useState } from "react";
import { Plus, Minus, Check } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
  storeId: string;
  storeName: string;
}

export default function AddToCartButton({
  product,
  storeId,
  storeName,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    // Get existing cart from localStorage
    const existingCart = localStorage.getItem("cart");
    let cart = existingCart ? JSON.parse(existingCart) : { storeId: null, storeName: null, items: [] };

    // Check if cart has items from different store
    if (cart.storeId && cart.storeId !== storeId && cart.items.length > 0) {
      const confirm = window.confirm(
        "لديك منتجات من متجر آخر. هل تريد إفراغ السلة وإضافة هذا المنتج؟"
      );
      if (!confirm) return;
      cart = { storeId, storeName, items: [] };
    }

    // Update cart
    cart.storeId = storeId;
    cart.storeName = storeName;

    const existingItem = cart.items.find(
      (item: { productId: string }) => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setQuantity((prev) => prev + 1);
    setAdded(true);

    // Dispatch custom event for cart update
    window.dispatchEvent(new Event("cartUpdated"));

    setTimeout(() => setAdded(false), 1500);
  };

  const handleRemove = () => {
    if (quantity <= 0) return;

    const existingCart = localStorage.getItem("cart");
    if (!existingCart) return;

    const cart = JSON.parse(existingCart);
    const existingItemIndex = cart.items.findIndex(
      (item: { productId: string }) => item.productId === product.id
    );

    if (existingItemIndex > -1) {
      if (cart.items[existingItemIndex].quantity > 1) {
        cart.items[existingItemIndex].quantity -= 1;
      } else {
        cart.items.splice(existingItemIndex, 1);
      }

      if (cart.items.length === 0) {
        cart.storeId = null;
        cart.storeName = null;
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      setQuantity((prev) => prev - 1);

      // Dispatch custom event for cart update
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleRemove}
          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"
        >
          <Minus className="w-4 h-4 text-slate-600" />
        </button>
        <span className="w-6 text-center font-medium">{quantity}</span>
        <button
          onClick={handleAdd}
          className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
        added
          ? "bg-green-100 text-green-700"
          : "bg-emerald-600 hover:bg-emerald-700 text-white"
      }`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          <span className="text-sm">تمت الإضافة</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          <span className="text-sm">إضافة</span>
        </>
      )}
    </button>
  );
}
