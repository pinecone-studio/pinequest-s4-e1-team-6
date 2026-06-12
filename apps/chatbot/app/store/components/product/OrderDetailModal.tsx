"use client";
import React from "react";
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Hash,
  Phone,
  Calendar,
} from "lucide-react";

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderDetailModal({
  order,
  onClose,
}: OrderDetailModalProps) {
  if (!order) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("mn-MN").format(price) + "₮";

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0D0D0D] border border-slate-200 dark:border-white/10 w-full max-w-4xl rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(197,160,89,0.2)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div className="p-2.5 sm:p-4 bg-[#C5A059]/10 rounded-xl sm:rounded-2xl text-[#C5A059] border border-[#C5A059]/20 shrink-0">
              <Hash size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic truncate">
                Захиалгын дэлгэрэнгүй
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 flex-wrap">
                <span className="text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">
                  ID: #{order.id.slice(-8).toUpperCase()}
                </span>
                <div className="w-1 h-1 bg-slate-200 dark:bg-gray-700 rounded-full hidden sm:block" />
                <span className="text-slate-500 dark:text-gray-500 text-[10px] font-bold flex items-center gap-1 uppercase">
                  <Calendar size={10} />{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 sm:p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl sm:rounded-2xl text-slate-500 dark:text-gray-500 transition-all hover:rotate-90 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {/* Customer info */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">
                <User size={12} /> Захиалагч
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#C5A059] to-[#8E723D] flex items-center justify-center text-black font-black uppercase shrink-0">
                    {order.customerName?.charAt(0) || "З"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-900 dark:text-white font-bold text-base sm:text-lg truncate">
                      {order.customerName || "Нэргүй зочин"}
                    </p>
                    <p className="text-[#C5A059] text-xs font-medium flex items-center gap-1 italic">
                      <Phone size={10} /> {order.customerPhone}
                    </p>
                  </div>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-slate-200 dark:border-white/5 flex items-start gap-2 text-slate-500 dark:text-gray-400 text-sm">
                  <MapPin
                    size={14}
                    className="text-[#C5A059] shrink-0 mt-0.5"
                  />
                  <span className="text-xs sm:text-sm">
                    {order.address || "Хүргэлтийн хаяг бүртгэгдээгүй байна."}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <CreditCard size={12} /> Гүйлгээний төлөв
              </div>
              <div className="bg-emerald-500/[0.02] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-500/10 flex flex-col justify-between min-h-[110px] sm:h-[140px]">
                <div>
                  <p className="text-slate-500 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                    Нийт төлсөн дүн
                  </p>
                  <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white italic mt-1 tracking-tighter">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase w-fit border border-emerald-500/20 mt-2 sm:mt-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {order.status}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 text-[#C5A059] text-[10px] font-black uppercase tracking-[0.2em]">
                <Package size={12} /> Сагсалсан бараанууд (
                {order.items?.length || 0})
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
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
                  <div
                    key={idx}
                    className="flex items-center gap-3 sm:gap-6 bg-slate-50 dark:bg-white/[0.02] p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 group hover:bg-white/[0.04] transition-all"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 relative">
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black text-white border border-white/10">
                        x{itemQty}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                      <p className="text-slate-900 dark:text-white font-bold text-sm sm:text-lg tracking-tight group-hover:text-[#C5A059] transition-colors truncate">
                        {itemName}
                      </p>
                      <p className="text-slate-500 dark:text-gray-500 text-[11px] sm:text-xs font-medium">
                        Нэгж үнэ:{" "}
                        {new Intl.NumberFormat("mn-MN").format(itemPrice)}₮
                      </p>
                    </div>

                    {/* Total */}
                    <div className="text-right shrink-0">
                      <p className="text-slate-500 dark:text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-tighter mb-0.5 sm:mb-1">
                        Нийт
                      </p>
                      <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white italic">
                        {new Intl.NumberFormat("mn-MN").format(
                          itemPrice * itemQty,
                        )}
                        ₮
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-3 shrink-0">
          <div className="hidden md:block min-w-0">
            <p className="text-slate-500 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Системд бүртгэгдсэн:
            </p>
            <p className="text-slate-900 dark:text-white text-xs font-mono opacity-50 truncate max-w-[200px]">
              {order.id}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-5 sm:px-10 py-3 sm:py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl sm:rounded-2xl transition-all border border-slate-200 dark:border-white/5"
            >
              Буцах
            </button>
            <button className="flex-1 md:flex-none px-5 sm:px-10 py-3 sm:py-4 bg-[#C5A059] hover:bg-[#d4b16d] text-black font-black uppercase tracking-widest text-[10px] rounded-xl sm:rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(197,160,89,0.5)] active:scale-95">
              Хүргэлтэнд бэлдэх
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
