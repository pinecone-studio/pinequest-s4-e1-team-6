"use client";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import OrdersPanel from "./OrdersPanel";
import { useOrders } from "../hooks/useOrders";

export default function OrdersButton() {
  const [open, setOpen] = useState(false);
  const orders = useOrders();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-24 right-6 z-50
          w-12 h-12 rounded-full
          bg-[#077eef] hover:bg-[#066fd4]
          flex items-center justify-center
          shadow-lg shadow-blue-500/30
          transition-all duration-200 active:scale-95
        "
      >
        <ShoppingBag size={20} className="text-white" />
        {orders.length > 0 && (
          <span
            className="
            absolute -top-1 -right-1
            w-5 h-5 rounded-full bg-red-500
            border-2 border-white
            flex items-center justify-center
            text-[9px] font-black text-white
          "
          >
            {orders.length > 9 ? "9+" : orders.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && <OrdersPanel onClose={() => setOpen(false)} orders={orders} />}
      </AnimatePresence>
    </>
  );
}
