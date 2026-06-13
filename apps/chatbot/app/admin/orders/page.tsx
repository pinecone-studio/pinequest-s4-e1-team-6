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

import { Fragment, useEffect, useState } from "react";

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
  customerPhone: string;
  address: string;
  store: { name: string } | null;
  items: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/admin/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-black text-white">
        Захиалга ({orders.length})
      </h1>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">№</th>
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
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr
                  className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {o.id.slice(-6).toUpperCase()}
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
                  <td className="px-5 py-3 font-bold text-amber-400">
                    {Number(o.totalAmount).toLocaleString()}₮
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      o.status === "PAID"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString("mn-MN")}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {o.items?.length ?? 0} бараа ▾
                  </td>
                </tr>

                {expanded === o.id && (
                  <tr>
                    <td colSpan={8} className="px-5 py-4 bg-white/[0.02]">
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
                                {item.quantity} ш × {Number(item.price).toLocaleString()}₮
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

        {orders.length === 0 && (
          <p className="p-8 text-center text-slate-500">Захиалга алга</p>
        )}
      </div>
    </div>
  );
}