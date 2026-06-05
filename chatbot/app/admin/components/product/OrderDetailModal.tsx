"use client";
import React from "react";
import { X, Package, User, MapPin, CreditCard, Hash, Phone, Calendar } from "lucide-react";

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const formatPrice = (price: number) => new Intl.NumberFormat("mn-MN").format(price) + "₮";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(197,160,89,0.2)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#C5A059]/10 rounded-2xl text-[#C5A059] border border-[#C5A059]/20">
              <Hash size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Захиалгын картын дэлгэрэнгүй</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">ID: #{order.id.slice(-8).toUpperCase()}</span>
                <div className="w-1 h-1 bg-gray-700 rounded-full" />
                <span className="text-gray-500 text-[10px] font-bold flex items-center gap-1 uppercase">
                  <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-2xl text-gray-500 transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">
                <User size={14} /> Захиалагч
              </div>
              <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C5A059] to-[#8E723D] flex items-center justify-center text-black font-black uppercase">
                     {order.customerName?.charAt(0) || "З"}
                   </div>
                   <div>
                     <p className="text-white font-bold text-lg">{order.customerName || "Нэргүй зочин"}</p>
                     <p className="text-[#C5A059] text-xs font-medium flex items-center gap-1 italic">
                       <Phone size={10} /> {order.customerPhone}
                     </p>
                   </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-start gap-2 text-gray-400 text-sm">
                   <MapPin size={16} className="text-[#C5A059] shrink-0" /> 
                   <span>{order.address || "Хүргэлтийн хаяг бүртгэгдээгүй байна."}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <CreditCard size={14} /> Гүйлгээний төлөв
              </div>
              <div className="bg-emerald-500/[0.02] p-6 rounded-[2rem] border border-emerald-500/10 flex flex-col justify-between h-[140px]">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Нийт төлсөн дүн</p>
                  <p className="text-4xl font-black text-white italic mt-1 tracking-tighter">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase w-fit border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                  {order.status}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">
                <Package size={14} /> Сагсалсан бараанууд ({order.items?.length || 0})
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
{order.items?.map((item: any, idx: number) => {

  const productInfo = item.product || {};

  const itemName = 
    item.productName || 
    item.name || 
    productInfo.name || 
    productInfo.title || 
    "Нэр тодорхойгүй бараа";

  const itemImage = 
    item.productImage || 
    item.image || 
    productInfo.image || 
    productInfo.thumbnail || 
    item.thumbnail || 
    "/placeholder.png";

  const itemPrice = Number(item.price || productInfo.price || 0);
  const itemQty = Number(item.quantity || item.qty || 1);

  return (
    <div key={idx} className="flex items-center gap-6 bg-white/[0.02] p-5 rounded-3xl border border-white/5 group hover:bg-white/[0.04] transition-all">
      <div className="w-24 h-24 rounded-2xl bg-gray-900 overflow-hidden border border-white/10 shrink-0 relative">
        <img 
          src={itemImage} 
          alt={itemName} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white border border-white/10">
          x{itemQty}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-white font-bold text-lg tracking-tight group-hover:text-[#C5A059] transition-colors">
          {itemName}
        </p>
        <p className="text-gray-500 text-xs font-medium">
          Нэгж үнэ: {new Intl.NumberFormat("mn-MN").format(itemPrice)}₮
        </p>
      </div>

      <div className="text-right">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-tighter mb-1">Нийт</p>
        <p className="text-xl font-black text-white italic">
          {new Intl.NumberFormat("mn-MN").format(itemPrice * itemQty)}₮
        </p>
      </div>
    </div>
  );    
})}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="hidden md:block">
             <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Системд бүртгэгдсэн:</p>
             <p className="text-white text-xs font-mono opacity-50">{order.id}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none px-10 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/5"
            >
              Буцах
            </button>
            <button className="flex-1 md:flex-none px-10 py-4 bg-[#C5A059] hover:bg-[#d4b16d] text-black font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(197,160,89,0.5)] active:scale-95">
              Хүргэлтэнд бэлдэх
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}