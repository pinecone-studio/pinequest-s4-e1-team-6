"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const { addToCart } = useCart();
  const productsPerPage = 4;

  useEffect(() => {
    void (async () => {
      const res = await fetch("/chat/api/favorites");
      if (!res.ok) return;
      const data: { productId: string }[] = await res.json();
      setSavedIds(data.map((favorite) => favorite.productId));
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const currentProducts = useMemo(() => {
    const start = currentPage * productsPerPage;
    return products.slice(start, start + productsPerPage);
  }, [currentPage, products]);

  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;
  const showPagination = products.length > productsPerPage;

  return (
    <div className="relative mx-auto w-full max-w-none select-none overflow-visible px-4 sm:px-8">
      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-2">
        {currentProducts.map((product, index) => (
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
              onSave={() => onSave?.(product.id)}
              onOrder={() => onBuy?.(product.name, product.price, product)}
              onAddToCart={(p) => addToCart(p)}
              savedIds={savedIds}
            />
          </motion.div>
        ))}
      </div>

      {showPagination && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
              disabled={!canGoBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141827]/90 px-4 py-2 text-sm font-semibold text-white/75 transition-all hover:border-[#9f8cff]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="rounded-full border border-white/10 bg-[#141827]/90 px-4 py-2 text-sm font-semibold text-white/70">
              {currentPage + 1} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
              disabled={!canGoForward}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#8b7bff] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              See more
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
