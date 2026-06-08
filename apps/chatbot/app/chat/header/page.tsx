"use client";

import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { MenuToggle } from "./components";

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
      <div className="flex items-center gap-4">
        
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
