"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./components/ProductCard";
import { useCart } from "@/app/context/CartContext";

export default function HorizontalProductStack({
  products = [],
  onSelect = () => {},
  onBuy, 
}: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const lastNavigationTime = useRef(0);
  const { addToCart } = useCart();

  const refreshFavorites = async () => {
    const res = await fetch("/chat/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setSavedIds(data.map((f: any) => f.productId));
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, []);

  const navigate = useCallback(
    (newDir: number) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < 250) return;
      lastNavigationTime.current = now;
      setCurrentIndex((prev) =>
        newDir > 0
          ? prev === products.length - 1
            ? 0
            : prev + 1
          : prev === 0
            ? products.length - 1
            : prev - 1,
      );
    },
    [products.length],
  );

  const getCardStyle = (index: number) => {
    let diff = index - currentIndex;
    const total = products.length;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    if (diff === 0)
      return { x: 0, scale: 1, opacity: 1, zIndex: 10, rotateY: 0 };
    if (Math.abs(diff) === 1)
      return {
        x:
          diff *
          (typeof window !== "undefined" && window.innerWidth < 768
            ? 140
            : 200),
        scale: 0.85,
        opacity: 0.5,
        zIndex: 5,
        rotateY: diff * -15,
      };
    return { x: diff > 0 ? 500 : -500, scale: 0.5, opacity: 0, zIndex: 0 };
  };

  return (
    <div className="relative flex h-[550px] w-full items-center justify-center overflow-visible select-none">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        <ChevronLeft />
      </button>

      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {products.map((product: any, index: number) => {
          const style = getCardStyle(index);
          const isCurrent = index === currentIndex;
          if (style.opacity === 0 && !isCurrent) return null;
          return (
            <motion.div
              key={`${product.id}-${index}`}
              className="absolute"
              animate={style}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ zIndex: style.zIndex }}
            >
              <ProductCard
                product={product}
                isCurrent={isCurrent}
                onSelect={() => onSelect(product)}
                onSave={() => {}}
                // ЭНД ХОЛБООС ХИЙГДЭЖ БАЙНА
                onOrder={() => {
                  if (onBuy) onBuy(product.name, product.price);
                }}
                onAddToCart={(p: any) => addToCart(p)}
                savedIds={savedIds}
              />
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => navigate(1)}
        className="absolute right-4 z-[60] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
