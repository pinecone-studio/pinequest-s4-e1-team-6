"use client";

import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { Menu, Store, X } from "lucide-react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

// Сайдбарыг уншуулах хэсэг (Header-ийн layout-ийг эвдэхгүй тулд цаана нь ажиллана)
const StoresPage = dynamic(() => import("./components/StoresPage"), {
  ssr: false,
  loading: () => null,
});

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const [isStoresOpen, setIsStoresOpen] = useState(false);

  // Дэлгүүр нээх функц
  const openStoresSidebar = () => {
    setIsStoresOpen(true);
    if (isCartOpen) setIsCartOpen(false);
  };

  // Сагс нээх функц
  const openCartSidebar = () => {
    setIsCartOpen(true);
    if (isStoresOpen) setIsStoresOpen(false);
  };

  return (
    <>
      <header
        className="apple-liquid-glass sticky top-0 z-50
        flex items-center justify-between gap-4
        px-5 py-3 mx-2 mt-2
        rounded-[50px]
        transition-all duration-300
        text-slate-900 dark:text-slate-100"
      >
        <span className="apple-liquid-fx" />

        {/* ── ЛОГО ХЭСЭГ ── */}
        <div className="flex items-center select-none font-sans group cursor-pointer">
          <span className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Chat
          </span>
          <div className="ml-1.5 p-[1.5px] rounded-lg bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(124,92,255,0.35)]">
            <div className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-950/85 backdrop-blur-sm">
              <span className="text-sm md:text-base font-extrabold tracking-wide uppercase text-neutral-900 dark:text-neutral-100">
                Mart
              </span>
            </div>
          </div>
        </div>

        {/* ── БАРУУН ТАЛЫН ТОВЧЛУУРУУД (Зэрэгцэж харагдана) ── */}
        <div className="flex items-center gap-2">
          
          {/* Sidebar нээх товч (Гар утсан дээр харагдана) */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="apple-liquid-control flex h-11 w-11 items-center justify-center rounded-full text-neutral-900 dark:text-white transition-all duration-200 hover:-translate-y-px hover:bg-white/18 dark:hover:bg-white/12 md:hidden"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {/* 🏪 ДЭЛГҮҮРҮҮД НЭЭХ ТОВЧЛУУР (Сагсны хажууд үргэлж харагдана) */}
          <button
            onClick={() => {
              if (isStoresOpen) {
                setIsStoresOpen(false);
              } else {
                openStoresSidebar();
              }
            }}
            className={`apple-liquid-control relative flex h-11 w-11 items-center justify-center rounded-full transition-all hover:-translate-y-px active:scale-95
            ${
              isStoresOpen
                ? "bg-white/20 dark:bg-white/15 ring-1 ring-white/20 text-neutral-900 dark:text-white"
                : "hover:bg-white/18 dark:hover:bg-white/12 text-neutral-900 dark:text-white"
            }`}
            aria-label="Toggle stores"
          >
            <Store className="h-[20px] w-[20px] text-neutral-900 dark:text-white" />
          </button>

          {/* 🛒 САГСНЫ ТОВЧЛУУР */}
          <button
            onClick={() => {
              if (isCartOpen) {
                setIsCartOpen(false);
              } else {
                openCartSidebar();
              }
            }}
            className={`apple-liquid-control relative flex h-11 w-11 items-center justify-center rounded-full transition-all hover:-translate-y-px active:scale-95
            ${
              isCartOpen
                ? "bg-white/20 dark:bg-white/15 ring-1 ring-white/20"
                : "hover:bg-white/18 dark:hover:bg-white/12"
            }`}
            aria-label="Open cart"
          >
            <FaShoppingCart className="text-[18px] text-neutral-900 dark:text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c5cff] text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </header>

      {/* ── СӨНГОХ ДЭЛГҮҮРҮҮДИЙН САЙДБАР (БҮРЭН АЖИЛЛАХ СҮҮДЭР ЛОГИК) ── */}
      <StoresPage 
        isOpen={isStoresOpen} 
        setIsOpen={setIsStoresOpen} 
        onCartOpen={openCartSidebar}
      />


    </>
  );
}