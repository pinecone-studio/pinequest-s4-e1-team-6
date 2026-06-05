import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export const useCart = () => {
  const { user } = useUser();
  const [cart, setCart] = useState<any[]>([]);

  const storageKey = user ? `cart_${user.id}` : "cart_guest";

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setCart(JSON.parse(stored));
  }, [user]);

  const saveCart = (items: any[]) => {
    setCart(items);
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const addToCart = (product: any) => {
    const updated = [...cart, product];
    saveCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(storageKey);
  };

  return { cart, addToCart, clearCart };
};