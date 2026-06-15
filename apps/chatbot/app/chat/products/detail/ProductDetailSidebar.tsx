"use client";

import { X, ShoppingBag, Plus, Minus, CreditCard, Store, ShieldCheck } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "./components/Footer";
import { createPortal } from "react-dom";
import { parsePrice } from "@/lib/utils/price";

interface Product {
  id: string;
  name: string;
  price: string | number;
  image: string;
  description?: string;
  storeId?: string;
  storeName?: string;
  stock?: string | number;
  selectedColor?: string;
  selectedSize?: string;
  metadata?: Record<string, unknown>;
  colorSizeStock?: unknown;
  color_size_stock?: unknown;
  sizeStock?: unknown;
  size_stock?: unknown;
}

interface Props {
  product: Product | null;
  onClose: () => void;
  onBuy: (name: string, price: string | number, product?: Product) => void;
}

export function ProductDetailSidebar({ product, onClose, onBuy }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const { addToCart, setIsCartOpen } = useCart();

  const numericPrice = parsePrice(product?.price ?? 0);
  const variants = useMemo(() => {
    if (!product) return [];

    const raw =
      product.metadata?.colorSizeStock ||
      product.metadata?.color_size_stock ||
      product.colorSizeStock ||
      product.color_size_stock ||
      product.metadata?.sizeStock ||
      product.metadata?.size_stock ||
      product.sizeStock ||
      product.size_stock;

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => ({
          color: String(item?.color || "").trim(),
          size: String(item?.size || "").trim(),
          stock: Math.max(0, Number(item?.stock) || 0),
        }))
        .filter((item) => item.color && item.size);
    } catch {
      return [];
    }
  }, [product]);
  const colors = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.color))),
    [variants],
  );
  const firstAvailableVariant =
    variants.find((variant) => variant.stock > 0) || variants[0];
  const activeColor = colors.includes(selectedColor)
    ? selectedColor
    : firstAvailableVariant?.color || "";
  const availableSizes = useMemo(
    () =>
      variants
        .filter((variant) => variant.color === activeColor)
        .map((variant) => variant.size),
    [activeColor, variants],
  );
  const activeSize = availableSizes.includes(selectedSize)
    ? selectedSize
    : variants.find((variant) => variant.color === activeColor && variant.stock > 0)
        ?.size ||
      variants.find((variant) => variant.color === activeColor)?.size ||
      "";
  const selectedVariant = variants.find(
    (variant) => variant.color === activeColor && variant.size === activeSize,
  );
  const maxQuantity =
    selectedVariant?.stock ??
    Number(product?.metadata?.stock ?? product?.stock ?? 0);
  const hasStockInfo =
    variants.length > 0 ||
    product?.metadata?.stock !== undefined ||
    product?.stock !== undefined;
  const isSoldOut = hasStockInfo && maxQuantity <= 0;

  if (!product) return null;

  const handleAddCart = async () => {
    if (isSoldOut) {
      alert("Энэ барааны үлдэгдэл дууссан байна.");
      return;
    }

    if (variants.length > 0 && (!selectedVariant || selectedVariant.stock < quantity)) {
      alert("Сонгосон өнгө, размерийн үлдэгдэл хүрэлцэхгүй байна.");
      return;
    }

    setIsAdding(true);
    const productWithQuantity = {
      ...product,
      price: numericPrice,
      quantity: quantity,
      selectedColor: activeColor,
      selectedSize: activeSize,
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
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-md "
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0, z: 100 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full md:w-112.5 bg-[#0b1024]/85 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col text-white"
        >
          {/* Дээд талын зөөлөн violet туяа */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(159,140,255,0.18),transparent_70%)]" />

          <div className="relative flex-1 overflow-y-auto p-8 custom-scrollbar">
            <button
              onClick={onClose}
              aria-label="Хаах"
              className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/50 active:scale-95"
            >
              <X size={18} />
            </button>

            <div className="group relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_18px_50px_rgba(8,12,30,0.45)]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {product.storeName && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                <Store size={13} className="text-[#9f8cff]" />
                {product.storeName}
              </div>
            )}

            <h1 className="mb-2 text-3xl font-black tracking-tight text-white">
              {product.name}
            </h1>
            <p className="mb-3 inline-block bg-gradient-to-r from-[#b7a6ff] to-[#8b7bff] bg-clip-text text-3xl font-black text-transparent">
              {numericPrice.toLocaleString()}₮
            </p>
            <div className="mb-8 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              Баталгаат бараа · Хурдан хүргэлт
            </div>

              <div className="space-y-6">
              {variants.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h3 className="text-white font-bold uppercase text-[10px] tracking-widest">
                    Сонголт
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                        Өнгө
                      </span>
                      <select
                        value={activeColor}
                        onChange={(event) => {
                          const color = event.target.value;
                          const nextSize =
                            variants.find(
                              (variant) =>
                                variant.color === color && variant.stock > 0,
                            )?.size ||
                            variants.find((variant) => variant.color === color)
                              ?.size ||
                            "";

                          setSelectedColor(color);
                          setSelectedSize(nextSize);
                          setQuantity(1);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white outline-none"
                      >
                        {colors.map((color) => (
                          <option key={color} value={color} className="text-black">
                            {color}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                        Размер
                      </span>
                      <select
                        value={activeSize}
                        onChange={(event) => {
                          setSelectedSize(event.target.value);
                          setQuantity(1);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white outline-none"
                      >
                        {availableSizes.map((size) => (
                          <option key={size} value={size} className="text-black">
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Энэ сонголтын үлдэгдэл: {selectedVariant?.stock ?? 0} ширхэг
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-[#b7a6ff] font-bold uppercase text-[10px] tracking-widest mb-3">
                  Тайлбар
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {product.description ||
                    "Энэ бүтээгдэхүүний дэлгэрэнгүй тайлбар одоогоор байхгүй байна."}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 ">
                <span className="text-sm font-medium text-slate-200">
                  Тоо ширхэг
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white transition-colors hover:border-[#9f8cff]/60 hover:bg-[#9f8cff]/15 hover:text-[#b7a6ff]"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-lg font-bold w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        maxQuantity > 0
                          ? Math.min(maxQuantity, quantity + 1)
                          : quantity + 1,
                      )
                    }
                    disabled={variants.length > 0 && maxQuantity <= quantity}
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white transition-colors hover:border-[#9f8cff]/60 hover:bg-[#9f8cff]/15 hover:text-[#b7a6ff] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-white/15"
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
            isSoldOut={isSoldOut}
            onBuy={(name, price) => {
              if (isSoldOut) return;
              onBuy(name, price, {
                ...product,
                selectedColor: activeColor,
                selectedSize: activeSize,
              });
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
