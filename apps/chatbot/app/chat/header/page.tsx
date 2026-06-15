"use client";

import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { Menu, Store, X } from "lucide-react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

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
  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const [isStoresOpen, setIsStoresOpen] = useState(false);

  return (
    <>
      <header
        className="apple-liquid-glass sticky top-0 z-50
        flex items-center md:justify-between justify-end gap-7
        px-5 py-3 mx-2 mt-2
        rounded-[50px]
        transition-all duration-300
        text-slate-900 dark:text-slate-100"
      >
        <span className="apple-liquid-fx" />

        {/* Лого хэсэг */}
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

        {/* Баруун талын товчлуурууд */}
        <div className="ml-auto flex items-center gap-2">
          {/* Sidebar нээх товч (Гар утсан дээр харагдана) */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="apple-liquid-control flex h-11 w-11 items-center justify-center rounded-full text-neutral-900 dark:text-white transition-all duration-200 hover:-translate-y-px hover:bg-white/18 dark:hover:bg-white/12 md:hidden"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {/* Дэлгүүр нээх товч (Сагстай адилхан бөөрөнхий загвартай болгов) */}
          <button
            onClick={() => {
              setIsStoresOpen(!isStoresOpen);
              if (isCartOpen) setIsCartOpen(false);
            }}
            className={`apple-liquid-control hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-px active:scale-95 md:flex
            ${
              isStoresOpen
                ? "bg-white/18 text-neutral-900 ring-1 ring-white/18 dark:bg-white/12 dark:text-white"
                : "text-white hover:bg-white/18 dark:text-white dark:hover:bg-white/12"
            }`}
            aria-label="Toggle stores"
          >
            <Store className="h-[16px] w-[16px]" />
            <span>Stores</span>
          </button>

          <button
            onClick={() => {
              setIsStoresOpen(!isStoresOpen);
              if (isCartOpen) setIsCartOpen(false);
            }}
            className={`apple-liquid-control relative flex h-11 w-11 items-center justify-center rounded-full transition-all hover:-translate-y-px active:scale-95 md:hidden
            ${
              isStoresOpen
                ? "bg-white/18 text-neutral-900 ring-1 ring-white/18 dark:bg-white/12 dark:text-white"
                : "text-white hover:bg-white/18 dark:text-white dark:hover:bg-white/12"
            }`}
            aria-label="Toggle stores"
          >
            <Store className="h-[20px] w-[20px]" />
          </button>

          {/* Сагс товч */}
          <button
            onClick={() => {
              setIsCartOpen(!isCartOpen);
              if (isStoresOpen) setIsStoresOpen(false);
            }}
            className={`apple-liquid-control relative flex h-11 w-11 items-center justify-center rounded-full transition-all hover:-translate-y-px active:scale-95
            ${
              isCartOpen
                ? "bg-white/18 dark:bg-white/12 ring-1 ring-white/18"
                : "hover:bg-white/18 dark:hover:bg-white/12"
            }`}
            aria-label="Open cart"
          >
            <FaShoppingCart className="text-[18px] text-[#ffffff] dark:text-[#9b8cff]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c5cff] text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isStoresOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close stores panel"
              onClick={() => setIsStoresOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9997] bg-slate-950/12 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="apple-liquid-glass fixed bottom-0 left-auto right-0 top-0 z-[9999] ml-auto flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden border-l border-white/10 shadow-[-18px_0_40px_rgba(0,0,0,0.22)]"
              style={{ left: "auto", right: 0 }}
            >
              <span className="apple-liquid-fx" />
              <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-22 text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#6c57e6] dark:text-[#9b8cff]" />
                  <span className="text-base font-semibold">Stores</span>
                </div>
                <button
                  onClick={() => setIsStoresOpen(false)}
                  className="apple-liquid-control flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/18 dark:hover:bg-white/12"
                  aria-label="Close stores"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-1">
                <StoresPage />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Side Panel */}
      {isCartOpen && (
        <div
          className="apple-liquid-glass fixed top-17 right-0 z-[9999]
          w-112.5 max-w-full h-[calc(100vh-68px)]
          flex flex-col
          border-l border-white/10
          shadow-[-10px_0_30px_rgba(0,0,0,0.25)]
          animate-in slide-in-from-right duration-200"
        >
          <span className="apple-liquid-fx" />
          <div className="flex items-center justify-between p-4 border-b border-white/10 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-[#6c57e6] dark:text-[#9b8cff] text-xl" />
              <span className="font-bold text-lg">Миний Сагс</span>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-black rounded-full bg-[#7c5cff] text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="apple-liquid-control flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/18 dark:hover:bg-white/12"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-slate-900 dark:text-slate-100">
            <div className="flex flex-col items-center justify-center h-full opacity-60 py-20">
              <FaShoppingCart className="text-5xl mb-3 text-slate-400" />
              <p className="text-sm font-medium">Сагсны контент энд харагдана</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
