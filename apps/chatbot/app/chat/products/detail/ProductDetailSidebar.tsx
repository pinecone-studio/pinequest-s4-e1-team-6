"use client";

import { X, ShoppingBag, Plus, Minus, CreditCard } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { createPortal } from "react-dom";

interface Product {
  id: string;
  name: string;
  price: string | number;
  image: string;
  description?: string;
}

interface Props {
  product: Product | null;
  onClose: () => void;
  onBuy: (name: string, price: any) => void;
}

export function ProductDetailSidebar({ product, onClose, onBuy }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();

  if (!product) return null;

  const numericPrice =
    typeof product.price === "string"
      ? parseFloat(product.price.replace(/[^0-9.]/g, ""))
      : Number(product.price);

  const handleAddCart = async () => {
    setIsAdding(true);
    const productWithQuantity = {
      ...product,
      price: numericPrice,
      quantity: quantity,
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    await addToCart(productWithQuantity);
    setIsAdding(false);
    onClose();
    setIsCartOpen(true);
  };

  return createPortal (
    <AnimatePresence>
      <div className=" fixed inset-0 z-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, z: 1000 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/10 backdrop-blur-xl "
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0, z: 100 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full md:w-112.5 bg-white/10  border-l border-white/10 shadow-2xl flex flex-col text-white"
        >
          {/* <Header title="Бүтээгдэхүүн" onClose={onClose} /> */}

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="group relative rounded-3xl overflow-hidden border border-white/10 bg-linear-to-b from-white/5 to-transparent mb-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            <h1 className="text-3xl font-black mb-2 tracking-tight text-black">
              {product.name}
            </h1>
            <p className="text-blue-400 text-3xl font-bold mb-8">
              {numericPrice.toLocaleString()}₮
            </p>

            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gray-500 border border-white/5">
                <h3 className="text-white font-bold uppercase text-[10px] tracking-widest mb-3">
                  Тайлбар
                </h3>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {product.description ||
                    "Энэ бүтээгдэхүүний дэлгэрэнгүй тайлбар одоогоор байхгүй байна."}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-gray-500 ">
                <span className="text-sm font-medium text-slate-200">
                  Тоо ширхэг
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-lg font-bold w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Footer
            product={product}
            quantity={quantity}
            numericPrice={numericPrice}
            isAdding={isAdding}
            onBuy={(name, price) => {
              onBuy(name, price);
              onClose(); 
            }}
            handleAddCart={handleAddCart}
          />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
