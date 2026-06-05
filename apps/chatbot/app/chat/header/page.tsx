"use client";

import { useState, useEffect } from "react";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { MenuToggle } from "./components";

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const { cartCount, setIsCartOpen } = useCart();
  const [favoriteCount, setFavoriteCount] = useState(0);

  const refreshCount = async () => {
    try {
      const res = await fetch("/chat/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavoriteCount(data.length);
      }
    } catch (err) {
      console.error("Fetch favorites error:", err);
    }
  };

  useEffect(() => {
    refreshCount();

    const handleInstantUpdate = (e: any) => {
      if (e?.detail && typeof e.detail.count === "number") {
        setFavoriteCount(e.detail.count);
      } else {
        refreshCount();
      }
    };

    window.addEventListener("updateFavoriteCount", handleInstantUpdate);
    return () =>
      window.removeEventListener("updateFavoriteCount", handleInstantUpdate);
  }, []);

  return (
    <header
      className=" sticky top-0 z-50
  flex items-center justify-between
  px-4 py-3

  bg-white/70 dark:bg-[#0D0D0D]/70
  backdrop-blur-xl

  border-b border-black/5 dark:border-white/10

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
          className="relative p-3 hover:bg-white/10 rounded-full transition-all"
        >
          <FaShoppingCart className="text-xl text-[#077eef]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#077eef] text-[10px] font-black text-white ring-2 ring-[#ffffff]">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
