"use client";

import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { MenuToggle } from "./components";
import { Bot, Sparkles, Store } from "lucide-react"; // Дэлгүүрийн икон нэмэв
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
        px-4 py-3
        bg-white/90 text-slate-900 dark:bg-slate-950/80 dark:text-slate-100
        backdrop-blur-xl
        border-b border-black/5 dark:border-white/10
        shadow-sm
        transition-all duration-300"
      >
        <div className="flex items-center select-none font-sans group cursor-pointer">
          {/* Chat хэсэг */}
          <span className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Chat
          </span>

          {/* Mart хэсэг */}
          <div className="ml-1.5 p-[1.5px] rounded-lg bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(124,92,255,0.35)]">
            <div className="px-2 py-0.5 rounded-[6px] bg-white dark:bg-neutral-950">
              <span className="text-sm md:text-base font-extrabold tracking-wide uppercase text-neutral-900 dark:text-neutral-100">
                Mart
              </span>
            </div>
          </div>
        </div>

        {/* Баруун талын товчлуурууд байрлах хэсэг */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStoresOpen(!isStoresOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all border
              ${
                isStoresOpen
                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  : "bg-[#7c5cff]/10 border-[#7c5cff]/20 text-[#7c5cff] dark:text-[#9b8cff] hover:bg-[#7c5cff]/20"
              }`}
          >
            <Store className="w-4 h-4" />
            {isStoresOpen ? "" : ""}
          </button>

          {/* 🛒 Сагсны товчлуур */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-3 transition-all hover:bg-black/5 dark:hover:bg-white/10"
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
      {isStoresOpen && (
        <div
          style={{
            position: "fixed",

            top: "60px",
            right: 0,
            width: "340px",
            height: "calc(100vh - 60px)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            background: "#0f1535",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            zIndex: 99999,
            boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
            animation: "slideIn 0.2s ease-out",
          }}
        >
          <StoresPage />
        </div>
      )}
    </>
  );
}
