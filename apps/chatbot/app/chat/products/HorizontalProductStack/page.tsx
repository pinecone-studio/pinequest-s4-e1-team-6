"use client";
import { useEffect, useRef, useState, type WheelEvent } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "./components/ProductCard";
import { useCart } from "@/app/context/CartContext";

type ProductItem = {
  id: string;
  name: string;
  price: string | number;
  image: string;
  description?: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type HorizontalProductStackProps = {
  products?: ProductItem[];
  onSelect?: (product: ProductItem) => void;
  onBuy?: (name: string, price: string | number, product?: ProductItem) => void;
  onSave?: (id: string) => void;
};

export default function HorizontalProductStack({
  products = [],
  onSelect = () => {},
  onBuy,
  onSave,
}: HorizontalProductStackProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    void (async () => {
      const res = await fetch("/chat/api/favorites");
      if (!res.ok) return;
      const data: { productId: string }[] = await res.json();
      setSavedIds(data.map((favorite) => favorite.productId));
    })();
  }, []);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    event.preventDefault();
    container.scrollLeft += event.deltaY;
  };

  return (
    <div className="relative mx-auto w-full max-w-none select-none overflow-visible">
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden px-4 pb-4 pt-1 sm:gap-6 sm:px-8 [-webkit-overflow-scrolling:touch] [scrollbar-color:rgba(159,140,255,0.55)_transparent] [scrollbar-width:thin]"
      >
        {products.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            className="h-full w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[340px] lg:w-[360px]"
          >
            <ProductCard
              product={product}
              layout="grid"
              onSelect={() => onSelect(product)}
              onSave={() => onSave?.(product.id)}
              onOrder={() => onBuy?.(product.name, product.price, product)}
              onAddToCart={(p) => addToCart(p)}
              savedIds={savedIds}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
