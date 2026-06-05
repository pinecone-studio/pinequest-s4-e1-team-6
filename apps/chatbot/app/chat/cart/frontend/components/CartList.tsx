"use client";

import { useEffect, useCallback, useState } from "react";
import CartItem from "./CartItem";

export default function CartList() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error("Cart loading error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!cart || !cart.items || cart.items.length === 0) {
    return <p className="text-gray-500 text-center py-10">Your cart is empty</p>;
  }

  const totalPrice = cart.items.reduce((acc: number, item: any) => {
    return acc + (item.price * item.quantity);
  }, 0);

  const clearCart = async () => {
    await fetch("/api/cart/clear", { method: "DELETE" });
    loadCart();
  };

  return (
    <div className="space-y-6">
      {cart.items.map((item: any) => (
        <CartItem key={item.id} item={item} refresh={loadCart} />
      ))}
      
      <div className="border-t border-white/10 pt-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Нийт дүн:</h2>
        <p className="text-2xl font-black text-[#C5A059]">{totalPrice.toLocaleString()} ₮</p>
      </div>
      
      <button className="w-full bg-[#C5A059] text-black font-bold py-4 rounded-xl hover:bg-white transition-all">
        Захиалах
      </button>
    </div>
  );
}