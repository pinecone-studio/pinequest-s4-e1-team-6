"use client";
import { motion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { Order } from "../hooks/useOrders";

export default function OrdersPanel({
  onClose,
  orders,
}: {
  onClose: () => void;
  orders: Order[];
}) {
  const total = orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="
          relative z-10 w-full sm:w-[380px]
          bg-white dark:bg-[#0f0f0f]
          border border-slate-200 dark:border-white/10
          rounded-t-[28px] sm:rounded-[28px]
          overflow-hidden shadow-2xl
          max-h-[80vh] flex flex-col
        "
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#077eef]" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Миний захиалгууд
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ShoppingBag
                size={36}
                strokeWidth={1.2}
                className="mb-3 opacity-40"
              />
              <p className="text-sm">Захиалга байхгүй байна</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0 bg-slate-100 dark:bg-white/5">
                  {order.image ? (
                    <img
                      src={order.image}
                      alt={order.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      🛍️
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {order.productName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {order.date}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-sm font-black text-[#077eef]">
                    {order.amount.toLocaleString()}₮
                  </span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      order.status === "Баталгаажсан"
                        ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                        : order.status === "Хүргэлтэнд"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-white/50"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {orders.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Нийт дүн</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {total.toLocaleString()}₮
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
