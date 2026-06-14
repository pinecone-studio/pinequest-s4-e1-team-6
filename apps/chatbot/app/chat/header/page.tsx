"use client";

import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { Store } from "lucide-react";
import StoresPage from "./components/StoresPage";
import { useState } from "react";

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
          rounded-[20px]
          bg-white/20 dark:bg-white/[0.08]
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
          <div className="ml-1.5 p-[1.5px] rounded-lg bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(124,92,255,0.35)]">
            <div className="px-2 py-0.5 rounded-[6px] bg-white/85 dark:bg-neutral-950/85 backdrop-blur-sm">
              <span className="text-sm md:text-base font-extrabold tracking-wide uppercase text-neutral-900 dark:text-neutral-100">
                Mart
              </span>
            </div>
          </div>
        </div>

        {/* Баруун товчлуурууд */}
        <div className="flex items-center gap-2">
          {/* Дэлгүүр товч */}
          <button
            onClick={() => setIsStoresOpen(!isStoresOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all
              backdrop-blur-md border
              shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]
              hover:-translate-y-px active:scale-95
              ${
                isStoresOpen
                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  : "bg-white/30 border-white/60 text-[#7c5cff] dark:text-[#9b8cff] hover:bg-white/50 dark:border-white/20 dark:bg-white/10"
              }`}
          >
            <Store className="w-4 h-4" />
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

      {/* Stores panel */}
      {isStoresOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            right: 0,
            width: "340px",
            height: "calc(100vh - 60px)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            borderLeft: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "-4px 0 40px rgba(31,38,135,0.12), inset 1px 0 0 rgba(255,255,255,0.6)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            zIndex: 99999,
            animation: "slideIn 0.2s ease-out",
          }}
        >
          <StoresPage />
        </div>
      )}
    </>
  );
}
