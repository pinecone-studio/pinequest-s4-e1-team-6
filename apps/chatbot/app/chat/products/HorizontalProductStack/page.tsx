"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "./components/ProductCard";
import { useCart } from "@/app/context/CartContext";

type ProductItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type HorizontalProductStackProps = {
  products?: ProductItem[];
  onSelect?: (product: ProductItem) => void;
  onBuy?: (name: string, price: string) => void;
};

export default function HorizontalProductStack({
  products = [],
  onSelect = () => {},
  onBuy,
}: HorizontalProductStackProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    void (async () => {
      const res = await fetch("/chat/api/favorites");
      if (!res.ok) return;
      const data: { productId: string }[] = await res.json();
      setSavedIds(data.map((favorite) => favorite.productId));
    })();
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-none select-none overflow-visible px-4 sm:px-8">
      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-2">
        {products.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            className="h-full"
          >
            <ProductCard
              product={product}
              layout="grid"
              onSelect={() => onSelect(product)}
              onSave={() => {}}
              onOrder={() => onBuy?.(product.name, product.price)}
              onAddToCart={(p) => addToCart(p)}
              savedIds={savedIds}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
