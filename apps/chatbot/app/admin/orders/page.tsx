// "use client";

// import { useEffect, useState } from "react";

// type O = {
//   id: string;
//   productName: string | null;
//   quantity: number;
//   price: number;
//   status?: string;
//   createdAt: string;
//   user: { name: string | null; email: string | null } | null;
//   store: { name: string } | null;
// };

// export default function AdminOrdersPage() {
//   const [orders, setOrders] = useState<O[]>([]);

//   useEffect(() => {
//     fetch("/admin/api/orders")
//       .then((r) => r.json())
//       .then((d) => setOrders(d.orders ?? []));
//   }, []);

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-black">Захиалга ({orders.length})</h1>
//       <div className="overflow-hidden rounded-2xl border border-white/10">
//         <table className="w-full text-sm">
//           <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
//             <tr>
//               <th className="px-5 py-3">Бараа</th>
//               <th className="px-5 py-3">Худалдан авагч</th>
//               <th className="px-5 py-3">Дэлгүүр</th>
//               <th className="px-5 py-3">Тоо</th>
//               <th className="px-5 py-3">Дүн</th>
//               <th className="px-5 py-3">Огноо</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((o) => (
//               <tr
//                 key={o.id}
//                 className="border-t border-white/5 hover:bg-white/[0.02]"
//               >
//                 <td className="px-5 py-3">{o.productName ?? "—"}</td>
//                 <td className="px-5 py-3 text-slate-400">
//                   {o.user?.name ?? o.user?.email ?? "—"}
//                 </td>
//                 <td className="px-5 py-3 text-slate-400">
//                   {o.store?.name ?? "—"}
//                 </td>
//                 <td className="px-5 py-3">{o.quantity}</td>
//                 <td className="px-5 py-3 font-medium">
//                   {(o.price * o.quantity).toLocaleString()}₮
//                 </td>
//                 <td className="px-5 py-3 text-slate-500">
//                   {new Date(o.createdAt).toLocaleDateString("mn-MN")}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {orders.length === 0 && (
//           <p className="p-8 text-center text-slate-500">Захиалга алга</p>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string;
  address: string;
  store: { name: string } | null;
  user: { name: string | null; email: string | null } | null;
  items: OrderItem[];
};

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
  DELIVERED: "bg-[#7c5cff]/15 text-[#9b8cff] border-[#7c5cff]/30",
};

const FILTERS = ["ALL", "PAID", "PENDING", "CANCELLED", "DELIVERED"] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => orders.filter((o) => filter === "ALL" || o.status === filter),
    [orders, filter],
  );

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "PAID" || o.status === "DELIVERED")
        .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    [orders],
  );

  const paidCount = orders.filter((o) => o.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-white">
          Захиалга <span className="text-slate-500">({orders.length})</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-[#7c5cff] text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {f === "ALL" ? "Бүгд" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Хураангуй карт */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-3xl font-black">{orders.length}</p>
          <p className="mt-1 text-sm text-slate-400">Нийт захиалга</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-3xl font-black text-emerald-400">{paidCount}</p>
          <p className="mt-1 text-sm text-slate-400">Төлбөр төлсөн</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-3xl font-black text-amber-400">
            {totalRevenue.toLocaleString()}₮
          </p>
          <p className="mt-1 text-sm text-slate-400">Нийт орлого</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">№</th>
              <th className="px-5 py-3">Худалдан авагч</th>
              <th className="px-5 py-3">Дэлгүүр</th>
              <th className="px-5 py-3">Утас</th>
              <th className="px-5 py-3">Хаяг</th>
              <th className="px-5 py-3">Нийт дүн</th>
              <th className="px-5 py-3">Төлөв</th>
              <th className="px-5 py-3">Огноо</th>
              <th className="px-5 py-3">Бараа</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <Fragment key={o.id}>
                <tr
                  className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {o.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-200">
                      {o.customerName ?? o.user?.name ?? "—"}
                    </p>
                    <p className="max-w-[180px] truncate text-xs text-slate-500">
                      {o.user?.email ?? ""}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-300">
                    {o.store?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {o.customerPhone}
                  </td>
                  <td className="px-5 py-3 text-slate-400 max-w-[160px] truncate">
                    {o.address}
                  </td>
                  <td className="px-5 py-3 font-bold text-amber-400 whitespace-nowrap">
                    {Number(o.totalAmount).toLocaleString()}₮
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        STATUS_STYLE[o.status] ??
                        "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("mn-MN")}
                  </td>
                  <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                    {o.items?.length ?? 0} бараа{" "}
                    <span className="text-slate-600">
                      {expanded === o.id ? "▴" : "▾"}
                    </span>
                  </td>
                </tr>

                {expanded === o.id && (
                  <tr>
                    <td colSpan={9} className="px-5 py-4 bg-white/[0.02]">
                      <div className="flex flex-col gap-2">
                        {o.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 bg-white/5 rounded-xl p-3"
                          >
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                className="w-12 h-12 rounded-lg object-cover"
                                alt={item.productName}
                              />
                            )}
                            <div>
                              <p className="font-bold text-white text-sm">
                                {item.productName}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.quantity} ш ×{" "}
                                {Number(item.price).toLocaleString()}₮
                              </p>
                            </div>
                            <p className="ml-auto font-bold text-white">
                              {(item.quantity * item.price).toLocaleString()}₮
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {!loading && shown.length === 0 && (
          <p className="p-8 text-center text-slate-500">Захиалга алга</p>
        )}
        {loading && (
          <p className="p-8 text-center text-slate-500">Уншиж байна…</p>
        )}
      </div>
    </div>
  );
}