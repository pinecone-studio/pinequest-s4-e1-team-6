"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, ChevronRight, Sparkles, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
}

interface VisualSearchResultsProps {
  products: Product[];
  sourceImage?: string;
  onProductClick: (product: Product) => void;
  onBuy: (name: string, price: string) => void;
}

function parsePrice(price: any): number {
  if (!price) return 0;
  const numeric = String(price).replace(/[^0-9.]/g, "");
  const result = parseFloat(numeric);
  return isNaN(result) ? 0 : result;
}

export const VisualSearchResults: React.FC<VisualSearchResultsProps> = ({
  products, sourceImage, onProductClick, onBuy,
}) => {
  const [selected, setSelected] = useState<Product | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-3 px-1"
      >
        <Sparkles size={11} className="text-[#C5A059]" />
        <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A059]/80">
          Зургаар хайсан үр дүн
        </span>
        <span className="text-white/30 text-xs">· {products.length} бараа</span>
      </motion.div>

      <div className="flex gap-3">
        {sourceImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidaden border border-[#C5A059]/40 shadow-[0_0_12px_rgba(197,160,89,0.2)]">
              <img src={sourceImage} alt="Хайлтын зураг" className="w-full h-full object-cover" />
              <div className="absolute bottom-0.5 right-0.5 bg-black/70 rounded-full p-0.5">
                <Search size={7} className="text-[#C5A059]" />
              </div>
            </div>
            <div className="w-px flex-1 mt-1 bg-gradient-to-b from-[#C5A059]/30 to-transparent min-h-[16px]" />
          </motion.div>
        )}

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {products.map((product, i) => {
            const isHovered = hoveredId === product.id;
            const price = parsePrice(product.price);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative cursor-pointer"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => { setSelected(product); onProductClick(product); }}
              >
                <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isHovered ? "border-[#C5A059]/60 shadow-[0_4px_20px_rgba(197,160,89,0.15)]" : "border-white/5"
                } bg-[#111]`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.image || `https://loremflickr.com/300/400/${encodeURIComponent(product.name)},product`}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 mb-0.5">{product.name}</p>
                      <p className="text-[#C5A059] text-xs font-black">
                        {price > 0 ? `${price.toLocaleString()}₮` : product.price}
                      </p>
                    </div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/25"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); onBuy(product.name, String(product.price)); }}
                            className="flex items-center gap-1 bg-[#C5A059] hover:bg-[#d4af6a] text-black text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg transition-colors"
                          >
                            <ShoppingBag size={11} />
                            Захиалах
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 bottom-8 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-10 sm:w-[400px] z-[201] bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 z-10 bg-black/50 text-white/60 hover:text-white rounded-full p-1.5">
                <X size={15} />
              </button>
              <div className="relative h-52 overflow-hidden">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
              </div>
              <div className="px-5 pb-5 -mt-3 relative">
                <p className="text-white text-base font-bold leading-snug mb-1">{selected.name}</p>
                {selected.description && (
                  <p className="text-white/45 text-sm mb-4 line-clamp-2">{selected.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-[#C5A059] text-xl font-black">
                    {parsePrice(selected.price) > 0 ? `${parsePrice(selected.price).toLocaleString()}₮` : selected.price}
                  </p>
                  <button
                    onClick={() => { onBuy(selected.name, String(selected.price)); setSelected(null); }}
                    className="flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#d4af6a] text-black font-bold px-4 py-2.5 rounded-2xl text-sm transition-colors"
                  >
                    <ShoppingBag size={13} />
                    Захиалах
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};