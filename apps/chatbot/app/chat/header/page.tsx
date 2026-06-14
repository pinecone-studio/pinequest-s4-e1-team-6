"use client";

import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { Store } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import dynamic from "next/dynamic";

// Hydration болон Turbopack/SSR алдаанаас сэргийлж зөвхөн клиент талд ачааллана
const StoresPage = dynamic(() => import("./components/StoresPage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7c5cff] border-t-transparent" />
    </div>
  ),
});

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { cartCount, setIsCartOpen } = useCart();
  const [isStoresOpen, setIsStoresOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50
          flex items-center md:justify-between justify-end gap-7 
          px-5 py-3 mx-2 mt-2
          rounded-[50px]
          bg-white/20 dark:bg-white/8
          backdrop-blur-2xl
          border border-white/45 dark:border-white/20
          shadow-[0_2px_0_rgba(255,255,255,0.6)_inset,0_8px_32px_rgba(31,38,135,0.10)]
          dark:shadow-[0_2px_0_rgba(255,255,255,0.12)_inset,0_8px_32px_rgba(0,0,0,0.3)]
          transition-all duration-300
          text-slate-900 dark:text-slate-100"
      >
        {/* Logo */}
        <div className="flex items-center select-none font-sans group cursor-pointer">
          <span className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Chat
          </span>
          <div className="ml-1.5 p-[1.5px] rounded-lg bg-linear-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(124,92,255,0.35)]">
            <div className="px-2 py-0.5 rounded-md bg-white/85 dark:bg-neutral-950/85 backdrop-blur-sm">
              <span className="text-sm md:text-base font-extrabold tracking-wide uppercase text-neutral-900 dark:text-neutral-100">
                Mart
              </span>
            </div>
          </div>
        </div>

        {/* Баруун товчлуурууд */}
        <div className="flex  items-center gap-2">
          {/* Дэлгүүр товч */}
          <button
            onClick={() => setIsStoresOpen(!isStoresOpen)}
            className={`md:flex hidden items-center gap-1.5 px-3 py-2 rounded-full text-xl font-bold transition-all
              backdrop-blur-md border
              shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]
              hover:-translate-y-px active:scale-95
              ${
                isStoresOpen
                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  : "bg-white/30 border-white/60 text-[#7c5cff] dark:text-[#9b8cff] hover:bg-white/50 dark:border-white/20 dark:bg-white/10"
              }`}
          >
            <Store className="w-6 h-6" />
          </button>

          {/* Сагсны товч */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-3 transition-all
              bg-white/28 backdrop-blur-md
              border border-white/60 dark:border-white/20
              shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]
              hover:bg-white/50 hover:-translate-y-px active:scale-95"
          >
            <FaShoppingCart className="text-xl text-[#7c5cff] dark:text-[#9b8cff]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c5cff] text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Stores Side Panel */}
      {isStoresOpen && (
        <div
          className="fixed top-17 right-0 z-9999  
            w-112.5 max-w-full h-[calc(100vh-68px)] 
            flex  flex-col overflow-y-auto
            bg-linear-to-b from-blue-400/10 via-blue-900/15 to-slate-900/30 
            backdrop-blur-[35px] border-l border-white/10 
            shadow-[-10px_0_30px_rgba(0,0,0,0.25)] 
            animate-in slide-in-from-right duration-200"
        >
          <StoresPage />
        </div>
      )}
    </>
  );
}
