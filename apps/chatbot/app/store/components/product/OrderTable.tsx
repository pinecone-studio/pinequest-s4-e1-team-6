// "use client";

// import React, { useState, useMemo } from "react";
// import { ChevronDown, ChevronUp, Package, ExternalLink, Search, Mail, Phone } from "lucide-react";
// import OrderDetailModal from "./OrderDetailModal";

// interface OrderTableProps {
//   orders: any[];
// }

// export default function OrderTable({ orders }: OrderTableProps) {
//   const [selectedOrder, setSelectedOrder] = useState<any>(null);
//   const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   const filteredOrders = useMemo(() => {
//     if (!searchTerm) return orders;

//     const s = searchTerm.toLowerCase();

//     return orders.filter((order) => {
//       const name = (order.customerName || "").toLowerCase();
//       const phone = (order.customerPhone || "").toLowerCase();
//       const email = (order.customerEmail || "").toLowerCase();
//       const id = (order.id || "").toLowerCase();

//       const hasProduct = order.items?.some((item: any) =>
//         (item.productName || item.name || "").toLowerCase().includes(s)
//       );

//       return (
//         name.includes(s) ||
//         phone.includes(s) ||
//         email.includes(s) ||
//         id.includes(s) ||
//         hasProduct
//       );
//     });
//   }, [searchTerm, orders]);

//   const toggleOrder = (id: string) => {
//     setExpandedOrderId(expandedOrderId === id ? null : id);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="relative group max-w-2xl">
//         <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
//           <Search className="h-5 w-5 text-gray-500 group-focus-within:text-[#C5A059] transition-colors" />
//         </div>
//         <input
//           type="text"
//           placeholder="Захиалгын ID, нэр, утас, и-мэйл эсвэл барааны нэрээр хайх..."
//           className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-white outline-none focus:border-[#C5A059]/40 focus:bg-white/[0.05] transition-all placeholder:text-gray-600 font-medium"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         {searchTerm && (
//           <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2 items-center">
//             <div className="text-[10px] font-black text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full uppercase tracking-widest">
//               {filteredOrders.length} илэрц
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="bg-[#0D0D0D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
//         <table className="w-full text-left border-collapse">
//           <thead className="bg-white/[0.03] text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">
//             <tr>
//               <th className="px-8 py-6">Захиалга</th>
//               <th className="px-8 py-6">Хэрэглэгч</th>
//               <th className="px-8 py-6">Нийт дүн</th>
//               <th className="px-8 py-6">Төлөв</th>
//               <th className="px-8 py-6 text-right">Үйлдэл</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-white/5">
//             {filteredOrders.length > 0 ? (
//               filteredOrders.map((order) => (
//                 <React.Fragment key={order.id}>
//                   <tr
//                     className="hover:bg-white/[0.04] transition-all cursor-pointer group"
//                     onClick={() => toggleOrder(order.id)}
//                   >
//                     <td className="px-8 py-6">
//                       <div className="flex flex-col gap-1">
//                         <span className="font-mono text-[#C5A059] font-bold text-xs uppercase">
//                           #{order.id.slice(-6)}
//                         </span>
//                         <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
//                           {new Date(order.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex flex-col">
//                         <span className="text-white font-bold group-hover:text-[#C5A059] transition-colors">
//                           {order.customerName || "Зочин"}
//                         </span>
//                         <div className="flex items-center gap-3 mt-1">
//                           <span className="text-[10px] text-gray-500 flex items-center gap-1">
//                             <Phone size={10} /> {order.customerPhone}
//                           </span>
//                           {order.customerEmail && (
//                             <span className="text-[10px] text-gray-500 flex items-center gap-1">
//                               <Mail size={10} /> {order.customerEmail}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6 font-black text-white italic">
//                       {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
//                     </td>
//                     <td className="px-8 py-6">
//                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
//                         order.status === 'PAID'
//                           ? 'bg-green-500/10 text-green-500 border border-green-500/20'
//                           : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
//                       }`}>
//                         {order.status}
//                       </span>
//                     </td>
//                     <td className="px-8 py-6 text-right">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedOrder(order);
//                         }}
//                         className="bg-white/5 hover:bg-[#C5A059] text-white hover:text-black p-3.5 rounded-2xl transition-all active:scale-95"
//                       >
//                         <ExternalLink size={18} />
//                       </button>
//                     </td>
//                   </tr>

//                   {expandedOrderId === order.id && (
//                     <tr className="bg-[#C5A059]/[0.02] animate-in fade-in slide-in-from-top-2 duration-300">
//                       <td colSpan={5} className="px-8 py-10 border-l-2 border-[#C5A059]/30">
//                         <div className="flex flex-col gap-6">
//                           <div className="flex justify-between items-end">
//                             <p className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em]">Захиалгын агуулга</p>
//                             <span className="text-[10px] text-gray-400">Нийт {order.items?.length || 0} төрлийн бараа</span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {order.items?.map((item: any, idx: number) => {
//                               const isMatch = searchTerm && (item.productName || item.name || "").toLowerCase().includes(searchTerm.toLowerCase());

//                               return (
//                                 <div key={idx} className={`flex justify-between items-center p-5 rounded-3xl border transition-all ${
//                                   isMatch ? 'bg-[#C5A059]/10 border-[#C5A059]/30' : 'bg-white/5 border-white/5'
//                                 }`}>
//                                   <div className="flex flex-col gap-1">
//                                     <span className={`font-bold ${isMatch ? 'text-[#C5A059]' : 'text-gray-200'}`}>
//                                       {item.productName || item.name}
//                                     </span>
//                                     <span className="text-gray-500 text-[10px] font-black uppercase">Тоо: {item.quantity} ш</span>
//                                   </div>
//                                   <span className="font-black text-white italic">{Number(item.price * item.quantity).toLocaleString()}₮</span>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={5} className="p-32 text-center text-gray-600">
//                   <div className="flex flex-col items-center gap-4">
//                     <div className="p-8 bg-white/5 rounded-full ring-1 ring-white/10">
//                       <Search size={48} className="opacity-20 text-[#C5A059]" />
//                     </div>
//                     <div className="space-y-1">
//                       <p className="text-white font-bold text-lg">Илэрц олдсонгүй</p>
//                       <p className="text-sm opacity-50 max-w-xs mx-auto">
//                         "{searchTerm}" утгатай таарах захиалга, хэрэглэгч эсвэл бараа олдсонгүй.
//                       </p>
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedOrder && (
//         <OrderDetailModal
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//         />
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { ChevronDown, ChevronUp, Package, ExternalLink } from "lucide-react";
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

//   if (loading)
//     return <div className="p-10 text-center text-white">Ачаалж байна...</div>;

//   return (
//     <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 text-white overflow-x-auto">
//       <table className="w-full text-sm text-left min-w-[800px]">
//         <thead className="text-xs text-gray-400 uppercase bg-white/5">
//           <tr>
//             <th className="px-6 py-4">№</th>
//             <th className="px-6 py-4">Хэрэглэгч</th>
//             <th className="px-6 py-4">Нийт дүн</th>
//             <th className="px-6 py-4">Төлөв</th>
//             <th className="px-6 py-4">Бараа</th>
//             <th className="px-6 py-4 text-right">Үйлдэл</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <React.Fragment key={order.id}>
//               <tr
//                 className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${expandedOrderId === order.id ? "bg-white/5" : ""}`}
//                 onClick={() => toggleOrder(order.id)}
//               >
//                 <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
//                   #{order.id.slice(-6).toUpperCase()}
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex flex-col">
//                     <span className="font-bold text-gray-100">
//                       {order.customerName || "Зочин"}
//                     </span>
//                     <span className="text-[10px] text-gray-500 font-mono tracking-tighter">
//                       {order.customerPhone}
//                     </span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 font-black text-[#C5A059]">
//                   {Number(order.totalAmount || 0).toLocaleString()}₮
//                 </td>
//                 <td className="px-6 py-4 text-[10px]">
//                   <span
//                     className={`px-2 py-1 rounded-full font-bold tracking-wider ${
//                       order.status === "PAID"
//                         ? "bg-green-500/20 text-green-500"
//                         : "bg-yellow-500/20 text-yellow-500"
//                     }`}
//                   >
//                     {order.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-2 text-gray-400">
//                     <Package
//                       size={14}
//                       className={
//                         expandedOrderId === order.id ? "text-[#C5A059]" : ""
//                       }
//                     />
//                     <span className="font-medium">
//                       {order.items?.length || 0} ш
//                     </span>
//                     {expandedOrderId === order.id ? (
//                       <ChevronUp size={14} className="text-[#C5A059]" />
//                     ) : (
//                       <ChevronDown size={14} />
//                     )}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 text-right">
//                   <button className="text-[#C5A059] hover:text-[#e0b668] font-bold text-xs flex items-center justify-end gap-1 ml-auto">
//                     Дэлгэрэнгүй <ExternalLink size={12} />
//                   </button>
//                 </td>
//               </tr>

//               {/* Дэлгэрэнгүй хэсэг */}
//               {expandedOrderId === order.id && (
//                 <tr className="bg-white/[0.02]">
//                   <td colSpan={6} className="px-6 py-8 border-b border-white/5">
//                     <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
//                       <div className="flex justify-between items-end mb-2">
//                         <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
//                           <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-pulse" />
//                           Захиалсан бүтээгдэхүүнүүд:
//                         </h4>
//                         <span className="text-[10px] text-gray-600 font-mono">
//                           ID: {order.id}
//                         </span>
//                       </div>

//                       <div className="grid gap-2">
//                         {order.items && order.items.length > 0 ? (
//                           order.items.map((item: any) => (
//                             <div
//                               key={item.id}
//                               className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-[#C5A059]/20 transition-all group"
//                             >
//                               <div className="flex items-center gap-4">
//                                 <div className="relative w-16 h-16 bg-gray-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
//                                   {item.productImage ? (
//                                     // <img
//                                     //   src={item.productImage}
//                                     //   alt={item.productName}
//                                     //   referrerPolicy="no-referrer"
//                                     //   className="w-full h-full object-cover"
//                                     //   loading="lazy"
//                                     // />
//                                     <img
//                                       src={item.productImage}
//                                       alt={item.productName}
//                                       className="w-12 h-12 rounded-lg object-cover"
//                                       onError={(e) => {
//                                         // Хэрэв зураг алдаа заавал placeholder харуулна
//                                         (e.target as HTMLImageElement).src =
//                                           "/no-image.png";
//                                       }}
//                                     />
//                                   ) : (
//                                     <Package
//                                       size={20}
//                                       className="text-gray-700"
//                                     />
//                                   )}
//                                 </div>
//                                 <div className="space-y-1">
//                                   <p className="text-sm font-bold text-gray-200 line-clamp-1">
//                                     {item.productName ||
//                                       "Бүтээгдэхүүний нэр байхгүй"}
//                                   </p>
//                                   <p className="text-[11px] text-gray-500 font-medium">
//                                     {item.quantity} ш ×{" "}
//                                     {Number(item.price).toLocaleString()}₮
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="text-right">
//                                 <p className="font-black text-sm text-gray-100">
//                                   {(
//                                     Number(item.quantity) * Number(item.price)
//                                   ).toLocaleString()}
//                                   ₮
//                                 </p>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
//                             <p className="text-xs text-gray-500 italic">
//                               Энэ захиалгад барааны мэдээлэл олдсонгүй.
//                             </p>
//                           </div>
//                         )}
//                       </div>

//                       {/* Хаяг болон Төлбөрийн мэдээлэл */}
//                       <div className="mt-4 p-4 bg-[#C5A059]/5 rounded-2xl border border-[#C5A059]/10 grid md:grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-[9px] uppercase font-bold text-[#C5A059] mb-1">
//                             Хүргэлтийн хаяг
//                           </p>
//                           <p className="text-xs text-gray-300 leading-relaxed">
//                             {order.address || "Хаяг тодорхойгүй"}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-[9px] uppercase font-bold text-[#C5A059] mb-1">
//                             Захиалсан огноо
//                           </p>
//                           <p className="text-xs text-gray-300">
//                             {new Date(order.createdAt).toLocaleString("mn-MN")}
//                           </p>
//                         </div>
//                       </div>
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

// // return (
// //   <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 text-white">
// //     <table className="w-full text-sm text-left">
// //       <thead className="text-xs text-gray-400 uppercase bg-white/5">
// //         <tr>
// //           <th className="px-6 py-4">№</th>
// //           <th className="px-6 py-4">Хэрэглэгч</th>
// //           <th className="px-6 py-4">Нийт дүн</th>
// //           <th className="px-6 py-4">Төлөв</th>
// //           <th className="px-6 py-4">Бараа</th>
// //           <th className="px-6 py-4">Үйлдэл</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {orders.map((order) => (
// //           <React.Fragment key={order.id}>
// //             <tr
// //               className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
// //               onClick={() => toggleOrder(order.id)}
// //             >
// //               <td className="px-6 py-4 font-mono text-xs text-gray-500">
// //                 {order.id.slice(-6).toUpperCase()}
// //               </td>
// //               <td className="px-6 py-4">
// //                 <div className="flex flex-col">
// //                   <span className="font-bold">{order.customerName || "Зочин"}</span>
// //                   <span className="text-[10px] text-gray-500">{order.customerPhone}</span>
// //                 </div>
// //               </td>
// //               <td className="px-6 py-4 font-black text-[#C5A059]">
// //                 {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
// //               </td>
// //               <td className="px-6 py-4 text-[10px]">
// //                  <span className={`px-2 py-1 rounded-full font-bold ${order.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
// //                   {order.status}
// //                  </span>
// //               </td>
// //               <td className="px-6 py-4">
// //                 <button className="flex items-center gap-1 text-gray-400 hover:text-white transition">
// //                   <Package size={14} />
// //                   {order.items?.length || 0} бараа
// //                   {expandedOrderId === order.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
// //                 </button>
// //               </td>
// //               <td className="px-6 py-4 text-[#C5A059] font-bold">Харах</td>
// //             </tr>

// //             {expandedOrderId === order.id && (
// //               <tr className="bg-white/3">
// //                 <td colSpan={6} className="p-6">
// //                   <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
// //                     <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
// //                       <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
// //                       Захиалгын дэлгэрэнгүй:
// //                     </h4>

// //                     {order.items && order.items.length > 0 ? (
// //                       order.items.map((item: any) => (
// //                         <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:border-[#C5A059]/30 transition-all">
// //                           <div className="flex items-center gap-4">
// //                             <div className="relative w-14 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center shrink-0">
// //                               {item.productImage ? (
// //                                 <img
// //                                   src={item.productImage}
// //                                   alt={item.productName}
// //                                   referrerPolicy="no-referrer"
// //                                   className="w-full h-full object-cover"
// //                                   onError={(e) => {
// //                                     (e.target as HTMLImageElement).src = "/placeholder.png";
// //                                   }}
// //                                 />
// //                               ) : (
// //                                 <Package size={20} className="text-gray-600" />
// //                               )}
// //                             </div>
// //                             <div>
// //                             <p className="text-sm font-bold text-gray-100">
// //                               {item.productName || item.name || "Нэр олдоогүй"}
// //                             </p>
// //                               <p className="text-[11px] text-gray-500 font-medium">
// //                                 {item.quantity} ш × {Number(item.price).toLocaleString()}₮
// //                               </p>
// //                             </div>
// //                           </div>
// //                           <div className="text-right">
// //                             <p className="font-black text-sm text-white">
// //                               {(item.quantity * item.price).toLocaleString()}₮
// //                             </p>
// //                           </div>
// //                         </div>
// //                       ))
// //                     ) : (
// //                       <p className="text-xs text-gray-500 italic p-4">Энэ захиалгад барааны мэдээлэл олдсонгүй.</p>
// //                     )}
// //                   </div>
// //                 </td>
// //               </tr>
// //             )}
// //           </React.Fragment>
// //         ))}
// //       </tbody>
// //     </table>
// //   </div>
// // );

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
    return <div className="p-10 text-center text-white">Ачаалж байна...</div>;

  return (
    <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 text-white overflow-x-auto">
      <table className="w-full text-sm text-left min-w-[800px]">
        <thead className="text-xs text-gray-400 uppercase bg-white/5">
          <tr>
            <th className="px-6 py-4">№</th>
            <th className="px-6 py-4">Хэрэглэгч</th>
            <th className="px-6 py-4">Нийт дүн</th>
            <th className="px-6 py-4">Төлөв</th>
            <th className="px-6 py-4">Бараа</th>
            <th className="px-6 py-4 text-right">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <tr
                className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${expandedOrderId === order.id ? "bg-white/5" : ""}`}
                onClick={() => toggleOrder(order.id)}
              >
                <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                  #{order.id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-100">
                      {order.customerName || "Зочин"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter">
                      {order.customerPhone}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 font-black text-[#C5A059]">
                  {Number(order.totalAmount || 0).toLocaleString()}₮
                </td>
                <td className="px-6 py-4 text-[10px]">
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
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-400">
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
                <td className="px-6 py-4 text-right">
                  <button className="text-[#C5A059] hover:text-[#e0b668] font-bold text-xs flex items-center justify-end gap-1 ml-auto">
                    Дэлгэрэнгүй <ExternalLink size={12} />
                  </button>
                </td>
              </tr>

              {expandedOrderId === order.id && (
                <tr className="bg-white/[0.02]">
                  <td colSpan={6} className="px-6 py-8 border-b border-white/5">
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-end mb-2">
                        <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-pulse" />
                          Захиалсан бүтээгдэхүүнүүд:
                        </h4>
                        <span className="text-[10px] text-gray-600 font-mono">
                          ID: {order.id}
                        </span>
                      </div>

                      <div className="grid gap-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-[#C5A059]/20 transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 bg-gray-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-gray-200 line-clamp-1">
                                    {item.productName ||
                                      "Бүтээгдэхүүний нэр байхгүй"}
                                  </p>
                                  <p className="text-[11px] text-gray-500 font-medium">
                                    {item.quantity} ш ×{" "}
                                    {Number(item.price).toLocaleString()}₮
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-sm text-gray-100">
                                  {(
                                    Number(item.quantity) * Number(item.price)
                                  ).toLocaleString()}
                                  ₮
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-xs text-gray-500 italic">
                              Энэ захиалгад барааны мэдээлэл олдсонгүй.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-4 bg-[#C5A059]/5 rounded-2xl border border-[#C5A059]/10 grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-[#C5A059] mb-1">
                            Хүргэлтийн хаяг
                          </p>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {order.address || "Хаяг тодорхойгүй"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase font-bold text-[#C5A059] mb-1">
                            Захиалсан огноо
                          </p>
                          <p className="text-xs text-gray-300">
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

// return (
//   <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 text-white">
//     <table className="w-full text-sm text-left">
//       <thead className="text-xs text-gray-400 uppercase bg-white/5">
//         <tr>
//           <th className="px-6 py-4">№</th>
//           <th className="px-6 py-4">Хэрэглэгч</th>
//           <th className="px-6 py-4">Нийт дүн</th>
//           <th className="px-6 py-4">Төлөв</th>
//           <th className="px-6 py-4">Бараа</th>
//           <th className="px-6 py-4">Үйлдэл</th>
//         </tr>
//       </thead>
//       <tbody>
//         {orders.map((order) => (
//           <React.Fragment key={order.id}>
//             <tr
//               className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
//               onClick={() => toggleOrder(order.id)}
//             >
//               <td className="px-6 py-4 font-mono text-xs text-gray-500">
//                 {order.id.slice(-6).toUpperCase()}
//               </td>
//               <td className="px-6 py-4">
//                 <div className="flex flex-col">
//                   <span className="font-bold">{order.customerName || "Зочин"}</span>
//                   <span className="text-[10px] text-gray-500">{order.customerPhone}</span>
//                 </div>
//               </td>
//               <td className="px-6 py-4 font-black text-[#C5A059]">
//                 {new Intl.NumberFormat("mn-MN").format(order.totalAmount)}₮
//               </td>
//               <td className="px-6 py-4 text-[10px]">
//                  <span className={`px-2 py-1 rounded-full font-bold ${order.status === 'PAID' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
//                   {order.status}
//                  </span>
//               </td>
//               <td className="px-6 py-4">
//                 <button className="flex items-center gap-1 text-gray-400 hover:text-white transition">
//                   <Package size={14} />
//                   {order.items?.length || 0} бараа
//                   {expandedOrderId === order.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
//                 </button>
//               </td>
//               <td className="px-6 py-4 text-[#C5A059] font-bold">Харах</td>
//             </tr>

//             {expandedOrderId === order.id && (
//               <tr className="bg-white/3">
//                 <td colSpan={6} className="p-6">
//                   <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
//                     <h4 className="text-[#C5A059] font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
//                       Захиалгын дэлгэрэнгүй:
//                     </h4>

//                     {order.items && order.items.length > 0 ? (
//                       order.items.map((item: any) => (
//                         <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:border-[#C5A059]/30 transition-all">
//                           <div className="flex items-center gap-4">
//                             <div className="relative w-14 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center shrink-0">
//                               {item.productImage ? (
//                                 <img
//                                   src={item.productImage}
//                                   alt={item.productName}
//                                   referrerPolicy="no-referrer"
//                                   className="w-full h-full object-cover"
//                                   onError={(e) => {
//                                     (e.target as HTMLImageElement).src = "/placeholder.png";
//                                   }}
//                                 />
//                               ) : (
//                                 <Package size={20} className="text-gray-600" />
//                               )}
//                             </div>
//                             <div>
//                             <p className="text-sm font-bold text-gray-100">
//                               {item.productName || item.name || "Нэр олдоогүй"}
//                             </p>
//                               <p className="text-[11px] text-gray-500 font-medium">
//                                 {item.quantity} ш × {Number(item.price).toLocaleString()}₮
//                               </p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <p className="font-black text-sm text-white">
//                               {(item.quantity * item.price).toLocaleString()}₮
//                             </p>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-xs text-gray-500 italic p-4">Энэ захиалгад барааны мэдээлэл олдсонгүй.</p>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </React.Fragment>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );
