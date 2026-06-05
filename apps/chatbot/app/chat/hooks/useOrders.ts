import { useState, useEffect } from "react";

export type Order = {
  orderId: string;
  productName: string;
  amount: number;
  date: string;
  image?: string;
  store_id?: string;
  status: "Баталгаажсан" | "Хүргэлтэнд" | "Хүлээн авсан";
};

const ORDERS_KEY = "user_orders";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) setOrders(JSON.parse(saved));
    } catch {}

    const handler = () => {
      try {
        const saved = localStorage.getItem(ORDERS_KEY);
        if (saved) setOrders(JSON.parse(saved));
      } catch {}
    };

    window.addEventListener("orders-updated", handler);
    return () => window.removeEventListener("orders-updated", handler);
  }, []);

  return orders;
}

export function saveOrder(order: Omit<Order, "status">) {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = saved ? JSON.parse(saved) : [];

    const exists = orders.some((o) => o.orderId === order.orderId);
    if (exists) return;

    const newOrder: Order = { ...order, status: "Баталгаажсан" };
    const updated = [newOrder, ...orders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("orders-updated"));
  } catch {}
}
