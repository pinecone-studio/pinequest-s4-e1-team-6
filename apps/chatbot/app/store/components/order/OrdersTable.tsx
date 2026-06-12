"use client";

// import { useEffect, useState } from "react";
// import { ChevronDown, ChevronUp, Package } from "lucide-react";
// import React from "react";

// export default function OrdersTable() {
//   const [orders, setOrders] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

//   const fetchData = async () => {
//     try {
//       const res = await fetch("/store/api/orders", { cache: "no-store" });
//       if (!res.ok) throw new Error("Алдаа гарлаа");
//       const data = await res.json();
//       setOrders(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const toggleOrder = (id: string) => {
//     setExpandedOrderId(expandedOrderId === id ? null : id);
//   };

//   if (loading) return <div className="p-10 text-center text-white">Ачаалж байна...</div>;

//   return (
//     <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 text-white">
//       <table className="w-full text-sm text-left">
//         <thead className="text-xs text-gray-400 uppercase bg-white/5">
//           <tr>
//             <th className="px-6 py-4">№</th>
//             <th className="px-6 py-4">Хэрэглэгч</th>
//             <th className="px-6 py-4">Нийт дүн</th>
//             <th className="px-6 py-4">Төлөв</th>
//             <th className="px-6 py-4">Бараа</th>
//             <th className="px-6 py-4">Үйлдэл</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <React.Fragment key={order.id}>
//               <tr
//                 className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
//                 onClick={() => toggleOrder(order.id)}
//               >
//                 <td className="px-6 py-4 font-mono text-xs text-gray-500">
//                   {order.id.slice(-6).toUpperCase()}
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex flex-col">
//                     <span className="font-bold">{order.customerName || "Зочин"}</span>
//                     <span className="text-[10px] text-gray-500">{order.customerPhone}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 font-black text-[#C5A059]">
//                   {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
//                 </td>
//                 <td className="px-6 py-4 text-[10px]">
//                    <span className={`px-2 py-1 rounded-full font-bold ${order.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
//                     {order.status}
//                    </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <button className="flex items-center gap-1 text-gray-400 hover:text-white transition">
//                     <Package size={14} />
//                     {order.items?.length || 0} бараа
//                     {expandedOrderId === order.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
//                   </button>
//                 </td>
//                 <td className="px-6 py-4 text-[#C5A059] font-bold">Харах</td>
//               </tr>

//               {expandedOrderId === order.id && (
//                 <tr className="bg-white/3">
//                   <td colSpan={6} className="p-6">
//                     <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
//                       <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
//                         Захиалгын дэлгэрэнгүй:
//                       </h4>

//                       {order.items && order.items.length > 0 ? (
//                         order.items.map((item: any) => (
//                           <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:border-[#C5A059]/30 transition-all">
//                             <div className="flex items-center gap-4">
//                               <div className="relative w-14 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center shrink-0">
//                                 {item.productImage ? (
//                                   <img
//                                     src={item.productImage}
//                                     alt={item.productName}
//                                     referrerPolicy="no-referrer"
//                                     className="w-full h-full object-cover"
//                                     onError={(e) => {
//                                       (e.target as HTMLImageElement).src = "/placeholder.png";
//                                     }}
//                                   />
//                                 ) : (
//                                   <Package size={20} className="text-gray-600" />
//                                 )}
//                               </div>
//                               <div>
//                               <p className="text-sm font-bold text-gray-100">
//                                 {item.productName || item.name || "Нэр олдоогүй"}
//                               </p>
//                                 <p className="text-[11px] text-gray-500 font-medium">
//                                   {item.quantity} ш × {Number(item.price).toLocaleString()}₮
//                                 </p>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="font-black text-sm text-white">
//                                 {(item.quantity * item.price).toLocaleString()}₮
//                               </p>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-xs text-gray-500 italic p-4">Энэ захиалгад барааны мэдээлэл олдсонгүй.</p>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

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
      // API массив буцаахгүй бол хамгаалалт
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
      <div className="p-10 text-center text-gray-400 bg-[#121212] rounded-2xl border border-white/10">
        <div className="inline-block w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Ачаалж байна...</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="p-16 text-center bg-[#121212] rounded-2xl border border-white/10">
        <ShoppingBag size={40} className="mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400 text-sm">
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
    <div className="bg-[#121212] rounded-2xl border border-white/10 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <p className="text-sm font-bold text-gray-200">
          Нийт <span className="text-[#C5A059]">{orders.length}</span> захиалга
        </p>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Шинэчлэх
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-white/5">
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
                {/* ── Захиалгын мөр ── */}
                <tr
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => toggleOrder(order.id)}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {order.id.slice(-6).toUpperCase()}
                  </td>

                  {/* Хэрэглэгч — customerName байхгүй тул утас + хаяг */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-gray-100">
                        {order.customerPhone || "Зочин"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate max-w-[140px]">
                        {order.address || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Огноо */}
                  <td className="px-6 py-4 text-xs text-gray-400">
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

                  {/* Дүн */}
                  <td className="px-6 py-4 font-black text-[#C5A059]">
                    {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
                  </td>

                  {/* Төлөв */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        order.status === "PAID"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  {/* Бараа товч */}
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition">
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

                {/* ── Дэлгэрэнгүй мөр ── */}
                {expandedOrderId === order.id && (
                  <tr className="bg-white/[0.03]">
                    <td colSpan={6} className="px-6 py-5">
                      <div className="flex flex-col gap-3">
                        <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                          Захиалгын дэлгэрэнгүй
                        </h4>

                        {/* Хаяг мэдээлэл */}
                        <div className="text-xs text-gray-400 flex gap-4 mb-1">
                          <span>📞 {order.customerPhone || "—"}</span>
                          <span>📍 {order.address || "—"}</span>
                          {order.store?.name && (
                            <span>🏪 {order.store.name}</span>
                          )}
                        </div>

                        {/* Бараанууд */}
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:border-[#C5A059]/30 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                {/* Зураг */}
                                <div className="relative w-14 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
                                  {item.productImage ? (
                                    <img
                                      src={item.productImage}
                                      alt={item.productName || "Бараа"}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                        // Parent-д fallback icon харуулна
                                        const parent = (
                                          e.target as HTMLImageElement
                                        ).parentElement;
                                        if (parent) {
                                          parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Package
                                      size={20}
                                      className="text-gray-600"
                                    />
                                  )}
                                </div>

                                {/* Нэр, тоо ширхэг */}
                                <div>
                                  <p className="text-sm font-bold text-gray-100">
                                    {item.productName || "Нэр олдоогүй"}
                                  </p>
                                  <p className="text-[11px] text-gray-500">
                                    {item.quantity} ш ×{" "}
                                    {Number(item.price).toLocaleString()}₮
                                  </p>
                                </div>
                              </div>

                              {/* Нийт үнэ */}
                              <p className="font-black text-sm text-white">
                                {(item.quantity * item.price).toLocaleString()}₮
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic p-4">
                            Энэ захиалгад барааны мэдээлэл олдсонгүй.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
