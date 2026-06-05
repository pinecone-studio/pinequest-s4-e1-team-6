"use client";

import { useState } from "react";
import { ProductDetailSidebar } from "../detail/ProductDetailSidebar";
import HorizontalProductStack from "../HorizontalProductStack/page";


interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId?: string;
  brand?: string;
  storeName?: string;
}

interface ProductCarouselProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onBuy: (name: string, price: any) => void;
  history?: any[];
}

export const ProductCarousel = ({
  products,
  onBuy,
  onSelect,
  history,
}: ProductCarouselProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full">
      <HorizontalProductStack
        products={products}
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
