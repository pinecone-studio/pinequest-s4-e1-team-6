import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  XCircle,
  Loader2,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
 
interface QPayPaymentProps {
  amount: number;
  orderId: string;
  onSuccess: (details: any) => void;
  onCancel: () => void;
}
 
const QPayPayment = ({
  amount,
  orderId,
  onSuccess,
  onCancel,
}: QPayPaymentProps) => {
  const [status, setStatus] = useState<"QR" | "PROCESSING" | "SUCCESS">("QR");
  const [timeLeft, setTimeLeft] = useState(300);
 
  useEffect(() => {
    if (status === "QR" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeLeft]);
 
  const handleVerify = async () => {
    setStatus("PROCESSING");
    setTimeout(() => {
      setStatus("SUCCESS");
    }, 2000);
  };
 
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
 
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md"
      />
 
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[40px] overflow-hidden w-full max-w-lg z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-7 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center text-center">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Төлбөр төлөх
            </h2>
            <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-black">
              QPay QR-аар төлөх
            </p>
          </div>
          <button
            onClick={onCancel}
            className="absolute right-6 top-7 text-slate-400 hover:text-[#077eef] transition-colors p-2"
          >
            <XCircle size={28} strokeWidth={1.5} />
          </button>
        </div>
 
        <div className="p-8 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {status === "QR" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* QR Code Container */}
                <div className="relative group mx-auto w-64 h-64">
                  <div className="absolute -inset-4 bg-[#077eef]/10 rounded-[45px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="bg-white p-6 rounded-[35px] relative flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-white/10 overflow-hidden">
                    <div className="w-full h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                      <QrCode size={48} className="text-[#077eef] opacity-80" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        #{orderId}
                      </span>
                    </div>
                  </div>
                </div>
 
                {/* Amount Display */}
                <div className="text-center space-y-2">
                  <p className="text-[11px] font-black text-[#077eef] uppercase tracking-[0.25em]">
                    Төлөх дүн
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {amount.toLocaleString()}
                    </h2>
                    <span className="text-2xl font-bold text-slate-400">₮</span>
                  </div>
                </div>
 
                {/* Timer & Progress */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Гүйлгээний хугацаа</span>
                    <span
                      className={
                        timeLeft < 60
                          ? "text-red-500 animate-pulse"
                          : "text-[#077eef]"
                      }
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 300) * 100}%` }}
                      transition={{ ease: "linear" }}
                      className="h-full bg-[#077eef] rounded-full shadow-[0_0_10px_rgba(7,126,239,0.5)]"
                    />
                  </div>
 
                  <button
                    onClick={handleVerify}
                    className="w-full py-5 bg-[#077eef] hover:bg-[#066fd4] text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] uppercase tracking-[0.1em]"
                  >
                    ТӨЛБӨР БАТАЛГААЖУУЛАХ
                  </button>
                </div>
              </motion.div>
            )}
 
            {status === "PROCESSING" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-[#077eef]/20" />
                  <Loader2 className="w-20 h-20 text-[#077eef] animate-spin stroke-[1.5]" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  Шалгаж байна
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
                  Түр хүлээнэ үү...
                </p>
              </motion.div>
            )}
 
            {status === "SUCCESS" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8"
              >
                <div className="py-6">
                  <div className="w-28 h-28 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                      className="bg-green-500 text-white rounded-full p-4 shadow-xl shadow-green-500/40"
                    >
                      <CheckCircle2 size={48} strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    Амжилттай
                  </h3>
                  <p className="text-green-600 dark:text-green-400 font-bold mt-2">
                    Таны захиалга баталгаажлаа
                  </p>
                </div>
 
                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 space-y-5 border border-slate-100 dark:border-white/5 shadow-inner">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Гүйлгээний №
                    </span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold tracking-tight">
                      {orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Төлсөн огноо
                    </span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
 
                <button
                  onClick={() => {
                    onSuccess({
                      transactionId: `QPY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                      amount,
                      date: new Date().toLocaleString(),
                    });
                  }}
                  className="w-full py-5 bg-[#077eef] hover:bg-[#066fd4] text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/30 transition-all uppercase tracking-widest active:scale-95"
                >
                  ЗАХИАЛГА ХАРАХ
                </button>
              </motion.div>
            )}
          </AnimatePresence>
 
 
          <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] pt-4 border-t border-slate-100 dark:border-white/5">
            <ShieldCheck size={14} className="text-[#077eef]" />
            <span>Secure SSL Encrypted Transaction</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
 
export default QPayPayment;
 
 
 
 