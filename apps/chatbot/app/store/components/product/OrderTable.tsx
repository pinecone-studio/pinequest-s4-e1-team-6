"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Package, ExternalLink } from "lucide-react";
import React from "react";

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/store/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Алдаа гарлаа");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-900 dark:text-white">
        Ачаалж байна...
      </div>
    );

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
      {/* block md:table -> Жижиг дэлгэц дээр блок болж, томрохоороо хүснэгт болно */}
      <table className="w-full text-sm text-left block md:table">
        {/* hidden md:table-header-group -> Гар утас дээр хүснэгтийн толгойг нууна */}
        <thead className="text-xs text-slate-500 dark:text-gray-400 uppercase bg-slate-100 dark:bg-white/5 hidden md:table-header-group">
          <tr>
            <th className="px-6 py-4">№</th>
            <th className="px-6 py-4">Хэрэглэгч</th>
            <th className="px-6 py-4">Нийт дүн</th>
            <th className="px-6 py-4">Төлөв</th>
            <th className="px-6 py-4">Бараа</th>
            <th className="px-6 py-4 text-right">Үйлдэл</th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              {/* Гар утас дээр тусдаа карт хэлбэртэй харагдах класс нэмсэн */}
              <tr
                className={`border-b border-slate-200 dark:border-white/5 hover:bg-white/5 transition-colors cursor-pointer block md:table-row p-4 md:p-0 mb-3 md:mb-0 rounded-xl md:rounded-none bg-slate-50/50 md:bg-transparent ${expandedOrderId === order.id ? "bg-slate-100 dark:bg-white/5" : ""}`}
                onClick={() => toggleOrder(order.id)}
              >
                {/* grid-cols-2 ашиглан гар утас дээрх бүтцийг гоёор хуваасан */}
                <div className="grid grid-cols-2 md:contents gap-2 md:gap-0">
                  <td className="md:px-6 md:py-4 font-mono text-[10px] text-slate-500 dark:text-gray-500 flex items-center md:table-cell">
                    <span className="md:hidden font-sans text-xs font-medium text-slate-400 mr-2">
                      №:
                    </span>
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="md:px-6 md:py-4 flex items-center md:table-cell col-span-2 md:col-span-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-gray-100">
                        {order.customerName || "Зочин"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-500 font-mono tracking-tighter">
                        {order.customerPhone}
                      </span>
                    </div>
                  </td>
                  <td className="md:px-6 md:py-4 font-black text-[#C5A059] flex items-center md:table-cell">
                    <span className="md:hidden font-sans text-xs font-medium text-slate-400 mr-2">
                      Дүн:
                    </span>
                    {Number(order.totalAmount || 0).toLocaleString()}₮
                  </td>
                  <td className="md:px-6 md:py-4 text-[10px] flex items-center md:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full font-bold tracking-wider ${
                        order.status === "PAID"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="md:px-6 md:py-4 flex items-center md:table-cell">
                    <span className="md:hidden font-sans text-xs font-medium text-slate-400 mr-2">
                      Бараа:
                    </span>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                      <Package
                        size={14}
                        className={
                          expandedOrderId === order.id ? "text-[#C5A059]" : ""
                        }
                      />
                      <span className="font-medium">
                        {order.items?.length || 0} ш
                      </span>
                      {expandedOrderId === order.id ? (
                        <ChevronUp size={14} className="text-[#C5A059]" />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>
                  </td>
                  <td className="md:px-6 md:py-4 text-right flex items-center justify-end md:table-cell">
                    <button className="text-[#C5A059] hover:text-[#e0b668] font-bold text-xs flex items-center justify-end gap-1 md:ml-auto">
                      Дэлгэрэнгүй <ExternalLink size={12} />
                    </button>
                  </td>
                </div>
              </tr>

              {expandedOrderId === order.id && (
                <tr className="bg-slate-50 dark:bg-white/[0.02] block md:table-row mb-4 md:mb-0 rounded-b-xl overflow-hidden">
                  <td
                    colSpan={6}
                    className="px-4 py-6 md:px-6 md:py-8 border-b border-slate-200 dark:border-white/5 block md:table-cell"
                  >
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-2">
                        <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-pulse" />
                          Захиалсан бүтээгдэхүүнүүд:
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-gray-600 font-mono break-all">
                          ID: {order.id}
                        </span>
                      </div>

                      <div className="grid gap-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-[#C5A059]/20 transition-all group gap-3 sm:gap-0"
                            >
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative w-16 h-16 bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                  {item.productImage ? (
                                    <img
                                      src={item.productImage}
                                      alt={item.productName}
                                      className="w-12 h-12 rounded-lg object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/no-image.png";
                                      }}
                                    />
                                  ) : (
                                    <Package
                                      size={20}
                                      className="text-gray-700"
                                    />
                                  )}
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                  <p className="text-sm font-bold text-slate-800 dark:text-gray-200 line-clamp-1">
                                    {item.productName ||
                                      "Бүтээгдэхүүний нэр байхгүй"}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-gray-500 font-medium">
                                    {item.quantity} ш ×{" "}
                                    {Number(item.price).toLocaleString()}₮
                                  </p>
                                </div>
                              </div>
                              <div className="text-right w-full sm:w-auto border-t sm:border-none pt-2 sm:pt-0 border-slate-200 dark:border-white/5">
                                <p className="font-black text-sm text-slate-800 dark:text-gray-100">
                                  {(
                                    Number(item.quantity) * Number(item.price)
                                  ).toLocaleString()}
                                  ₮
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 bg-slate-100 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-xs text-slate-500 dark:text-gray-500 italic">
                              Энэ захиалгад барааны мэдээлэл олдсонгүй.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Хүргэлтийн хаяг ба огноо хэсгийг grid md:grid-cols-2 болгож жижиг дэлгэц дээр доош дундалсан */}
                      <div className="mt-4 p-4 bg-[#C5A059]/5 rounded-2xl border border-[#C5A059]/10 grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-[#C5A059] mb-1">
                            Хүргэлтийн хаяг
                          </p>
                          <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                            {order.address || "Хаяг тодорхойгүй"}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-[9px] uppercase font-bold text-[#C5A059] mb-1">
                            Захиалсан огноо
                          </p>
                          <p className="text-xs text-slate-700 dark:text-gray-300">
                            {new Date(order.createdAt).toLocaleString("mn-MN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
