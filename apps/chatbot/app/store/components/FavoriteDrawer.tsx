"use client";

import { Heart, X, ShoppingCart } from "lucide-react";
import { useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoriteStore } from "../useFavoriteStore";

export const FavoriteDrawer = () => {
  const { savedProducts, toggleFavorite, fetchFavorites } = useFavoriteStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (fetchFavorites) {
      fetchFavorites();
    }
  }, [fetchFavorites]);

  if (!mounted || savedProducts.length === 0) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-25 right-10 z-50 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hover:bg-white/20 transition-all"
      >
        <div className="relative">
          <Heart size={25} className="text-red-500" fill="currentColor" />
          <span className="absolute -top-7 -right-7 bg-red-500 text-white text-[19px] w-7 h-7 rounded-full flex items-center justify-center font-bold">
            {savedProducts.length}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-80 bg-[#121212] border-l border-white/10 z-100 shadow-2xl p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart size={20} fill="currentColor" className="text-red-500" /> Хадгалсан
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X className="text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              {savedProducts.map(product => (
                <div key={product.id} className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 relative group">
                  <img src={product.image} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-[#C5A059] font-bold">{product.price}₮</p>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(product)}
                    className="p-1 text-white/40 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

