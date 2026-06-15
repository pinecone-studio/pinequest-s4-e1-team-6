"use client";

import { useState } from "react";
import { ProductDetailSidebar } from "../detail/ProductDetailSidebar";
import HorizontalProductStack from "../HorizontalProductStack/page";


interface Product {
  id: string;
  name: string;
  price: string | number;
  image: string;
  description?: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
  stock?: string | number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ProductCarouselProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onBuy: (name: string, price: string | number, product?: Product) => void;
}

export const ProductCarousel = ({
  products,
  onBuy,
  onSelect,
}: ProductCarouselProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const visibleProducts = products.filter((product) => {
    const stock = product.metadata?.stock ?? product.stock;
    if (stock === undefined) return true;

    return Number(stock) > 0;
  });

  if (!visibleProducts || visibleProducts.length === 0) return null;

  return (
    <div className="w-full">
      <HorizontalProductStack
        products={visibleProducts}
        onSelect={(product: Product) => {
          setSelectedProduct(product);
          onSelect(product);
        }}
        onSave={(id: string) => console.log("Saved ID:", id)}
        onBuy={onBuy}
      />

      {selectedProduct && (
        <ProductDetailSidebar
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={onBuy}
        />
      )}
    </div>
  );
};
