"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/store/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Алдаа гарлаа");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 sm:p-10 text-center text-slate-500 dark:text-gray-400 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Ачаалж байна...</p>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="p-10 sm:p-16 text-center bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10">
        <ShoppingBag
          size={40}
          className="mx-auto text-slate-400 dark:text-gray-600 mb-4"
        />
        <p className="text-slate-500 dark:text-gray-400 text-sm">
          Одоогоор захиалга байхгүй байна.
        </p>
        <button
          onClick={() => fetchData(true)}
          className="mt-4 text-xs text-[#C5A059] hover:underline flex items-center gap-1 mx-auto"
        >
          <RefreshCw size={12} /> Шинэчлэх
        </button>
      </div>
    );
  }

  // ── Table ─────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10">
        <p className="text-sm font-bold text-slate-800 dark:text-gray-200">
          Нийт <span className="text-[#C5A059]">{orders.length}</span> захиалга
        </p>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 hover:text-[#C5A059] transition disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Шинэчлэх</span>
        </button>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-100 dark:bg-white/5">
            <tr>
              <th className="px-6 py-4">№</th>
              <th className="px-6 py-4">Хэрэглэгч</th>
              <th className="px-6 py-4">Огноо</th>
              <th className="px-6 py-4">Нийт дүн</th>
              <th className="px-6 py-4">Төлөв</th>
              <th className="px-6 py-4">Бараа</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => toggleOrder(order.id)}
                >
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-gray-500">
                    {order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 dark:text-gray-100">
                        {order.customerPhone || "Зочин"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-500 truncate max-w-[140px]">
                        {order.address || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-400">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("mn-MN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 font-black text-[#C5A059]">
                    {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-[#C5A059] transition">
                      <Package size={14} />
                      <span>{order.items?.length || 0} бараа</span>
                      {expandedOrderId === order.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded detail row */}
                {expandedOrderId === order.id && (
                  <tr className="bg-slate-50 dark:bg-white/[0.03]">
                    <td colSpan={6} className="px-6 py-5">
                      <OrderDetail order={order} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden divide-y divide-slate-200 dark:divide-white/5">
        {orders.map((order) => (
          <div key={order.id}>
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              onClick={() => toggleOrder(order.id)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <p className="font-bold text-sm text-slate-800 dark:text-gray-100">
                    {order.customerPhone || "Зочин"}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate max-w-[180px]">
                    {order.address || "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="font-black text-sm text-[#C5A059]">
                    {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-gray-500">
                <span>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("mn-MN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                  <Package size={12} />
                  {order.items?.length || 0} бараа
                  {expandedOrderId === order.id ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </span>
              </div>
            </div>

            {/* Mobile expanded */}
            {expandedOrderId === order.id && (
              <div className="px-4 pb-4 bg-slate-50 dark:bg-white/[0.03]">
                <OrderDetail order={order} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reusable components ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
        status === "PAID"
          ? "bg-green-500/20 text-green-400"
          : status === "PENDING"
            ? "bg-yellow-500/20 text-yellow-400"
            : "bg-gray-500/20 text-slate-500 dark:text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}

function OrderDetail({ order }: { order: any }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
        Захиалгын дэлгэрэнгүй
      </h4>

      <div className="text-xs text-slate-500 dark:text-gray-400 flex flex-wrap gap-2 sm:gap-4 mb-1">
        <span>📞 {order.customerPhone || "—"}</span>
        <span>📍 {order.address || "—"}</span>
        {order.store?.name && <span>🏪 {order.store.name}</span>}
      </div>

      {order.items && order.items.length > 0 ? (
        order.items.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-slate-100 dark:bg-white/5 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#C5A059]/30 transition-all gap-3"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 bg-slate-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 shrink-0 flex items-center justify-center">
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName || "Бараа"}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement)
                        .parentElement;
                      if (parent) {
                        parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
                      }
                    }}
                  />
                ) : (
                  <Package
                    size={18}
                    className="text-slate-400 dark:text-gray-600"
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-100 truncate">
                  {item.productName || "Нэр олдоогүй"}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-gray-500">
                  {item.quantity} ш × {Number(item.price).toLocaleString()}₮
                </p>
              </div>
            </div>

            <p className="font-black text-xs sm:text-sm text-slate-900 dark:text-white shrink-0">
              {(item.quantity * item.price).toLocaleString()}₮
            </p>
          </div>
        ))
      ) : (
        <p className="text-xs text-slate-500 dark:text-gray-500 italic p-4">
          Энэ захиалгад барааны мэдээлэл олдсонгүй.
        </p>
      )}
    </div>
  );
}
