"use client";

import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { MenuToggle } from "./components";
import { Bot, Sparkles } from "lucide-react";
export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header
      className=" sticky top-0 z-50
  flex items-center justify-between
  px-4 py-3

  bg-white/90 text-slate-900 dark:bg-slate-950/80 dark:text-slate-100
  backdrop-blur-xl

  border-b border-black/5 dark:border-white/10
  shadow-sm

  transition-all duration-300
"
    >
      <div className="flex items-center select-none font-sans group cursor-pointer">
  {/* Chat хэсэг нь энгийн цагаан/бараан */}
  <span className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
    Chat
  </span>

  {/* Mart хэсэг нь тусдаа гоё хүрээтэй хайрцаг дотор */}
  <div className="ml-1.5 p-[1.5px] rounded-lg bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.4)]">
    <div className="px-2 py-0.5 rounded-[6px] bg-white dark:bg-neutral-950">
      <span className="text-sm md:text-base font-extrabold tracking-wide uppercase text-neutral-900 dark:text-neutral-100">
        Mart
      </span>
    </div>
  </div>
</div>

      <div className="flex items-center gap-3">
        {/* <button
          onClick={() => window.dispatchEvent(new CustomEvent("openFavorites"))}
          className="relative p-3 hover:bg-white/10 rounded-full transition-all"
        >
          <FaHeart
            className={`text-xl transition-colors duration-100 ${
              favoriteCount > 0 ? "text-red-500" : "text-[#C5A059]"
            }`}
          />

          {favoriteCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-[#ffffff]">
              {favoriteCount}
            </span>
          )}
        </button> */}

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
  );
}
