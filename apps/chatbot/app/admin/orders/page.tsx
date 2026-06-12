"use client";

import { useEffect, useState } from "react";

type O = {
  id: string;
  productName: string | null;
  quantity: number;
  price: number;
  status?: string;
  createdAt: string;
  user: { name: string | null; email: string | null } | null;
  store: { name: string } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<O[]>([]);

  useEffect(() => {
    fetch("/admin/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Захиалга ({orders.length})</h1>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Бараа</th>
              <th className="px-5 py-3">Худалдан авагч</th>
              <th className="px-5 py-3">Дэлгүүр</th>
              <th className="px-5 py-3">Тоо</th>
              <th className="px-5 py-3">Дүн</th>
              <th className="px-5 py-3">Огноо</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-t border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3">{o.productName ?? "—"}</td>
                <td className="px-5 py-3 text-slate-400">
                  {o.user?.name ?? o.user?.email ?? "—"}
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {o.store?.name ?? "—"}
                </td>
                <td className="px-5 py-3">{o.quantity}</td>
                <td className="px-5 py-3 font-medium">
                  {(o.price * o.quantity).toLocaleString()}₮
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(o.createdAt).toLocaleDateString("mn-MN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-8 text-center text-slate-500">Захиалга алга</p>
        )}
      </div>
    </div>
  );
}
