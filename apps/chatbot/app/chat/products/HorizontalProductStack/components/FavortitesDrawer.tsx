"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesDrawer = ({ isOpen, onClose }: FavoritesDrawerProps) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { addToCart } = useCart();

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/chat/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFavorites();
    }
  }, [isOpen]);

  const handleRemove = async (productId: string) => {
    try {
      const updatedFavorites = favorites.filter(
        (f) => (f.productId || f.id) !== productId,
      );
      setFavorites(updatedFavorites);

      window.dispatchEvent(
        new CustomEvent("updateFavoriteCount", {
          detail: { count: updatedFavorites.length },
        }),
      );

      await fetch("/chat/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch (e) {
      console.error("Remove error:", e);
      fetchFavorites();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-[#121212] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={20} />
                <h2 className="text-white text-xl font-bold">
                  Хадгалсан ({favorites.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 italic">
                  <Heart size={48} className="mb-4 opacity-5" />
                  <p>Жагсаалт хоосон байна</p>
                </div>
              ) : (
                favorites.map((f: any) => {
                  const item = f.product || f;
                  const displayImg =
                    item.images?.[0] || item.image || "/default-product.png";
                  const pId = f.productId || f.id;

                  return (
                    <motion.div
                      layout
                      key={pId}
                      className="group flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#C5A059]/30 transition-all"
                    >
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        <img
                          src={displayImg}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-1">
                        <h3 className="text-white font-medium line-clamp-1 text-sm">
                          {item.name || "Нэргүй бараа"}
                        </h3>
                        <p className="text-[#C5A059] font-bold">
                          {item.price?.toLocaleString()}₮
                        </p>
                        <button
                          onClick={() => {
                            addToCart(item);
                            onClose();
                          }}
                          className="text-[10px] text-white/50 flex items-center gap-1 hover:text-[#C5A059] transition-colors"
                        >
                          <ShoppingBag size={12} /> Сагслах
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(pId)}
                        className="p-2 text-white/20 hover:text-red-500 self-center transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-[#121212]">
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#C5A059] text-black rounded-2xl font-bold hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Үргэлжлүүлэн үзэх
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
