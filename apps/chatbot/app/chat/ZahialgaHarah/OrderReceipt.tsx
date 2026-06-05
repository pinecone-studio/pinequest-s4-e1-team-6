"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import {
  XCircle,
  Package,
  Tag,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Hash,
} from "lucide-react";
import { saveOrder } from "../hooks/useOrders";

interface OrderReceiptProps {
  orderData: {
    productName: string;
    amount: number;
    orderId: string;
    date: string;
    image?: string;
    transactionId?: string;
  };
  onClose: () => void;
}

const OrderReceipt = ({ orderData, onClose }: OrderReceiptProps) => {
  useEffect(() => {
    saveOrder({
      orderId: orderData.orderId,
      productName: orderData.productName,
      amount: orderData.amount,
      date: orderData.date,
      image: orderData.image,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[40px] overflow-hidden w-full max-w-md z-10 shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#077eef]/10 dark:bg-[#077eef]/20 rounded-2xl flex items-center justify-center">
              <Package size={20} className="text-[#077eef]" />
            </div>
            <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
              Захиалгын тасалбар
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#077eef] transition-colors p-2"
          >
            <XCircle size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-6">
              <div className="absolute -inset-4 bg-[#077eef]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-32 h-32 bg-slate-50 dark:bg-white/5 rounded-[35px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center relative">
                {orderData.image ? (
                  <img
                    src={orderData.image}
                    alt={orderData.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag size={40} className="text-[#077eef] opacity-40" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white dark:border-[#0f0f0f] shadow-lg">
                <CheckCircle2 size={16} strokeWidth={3} />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white text-center leading-tight tracking-tight">
              {orderData.productName}
            </h3>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#077eef] tracking-tighter">
                {orderData.amount.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-slate-400">₮</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6 space-y-5 shadow-inner">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Hash size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Дугаар
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {orderData.orderId}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/5 pt-5">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Огноо
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {orderData.date}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/5 pt-5">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Төлөв
                </span>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black rounded-full uppercase tracking-tighter">
                Баталгаажсан
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 py-5 bg-[#077eef] hover:bg-[#066fd4] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Дуусгах <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderReceipt;
