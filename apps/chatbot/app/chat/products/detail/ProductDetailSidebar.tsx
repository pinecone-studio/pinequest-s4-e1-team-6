"use client";

import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  CreditCard,
  Store,
  ShieldCheck,
  Ruler,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Reviews } from "./components/Reviews";
import { createPortal } from "react-dom";
import { parsePrice } from "@/lib/utils/price";

const SIZE_GUIDE = [
  { size: "M", chest: "96-100", length: "70" },
  { size: "L", chest: "100-104", length: "72" },
  { size: "XL", chest: "104-108", length: "74" },
  { size: "2XL", chest: "108-112", length: "76" },
  { size: "3XL", chest: "112-116", length: "78" },
];

interface Product {
  id: string;
  name: string;
  price: string | number;
  image: string;
  description?: string;
  storeId?: string;
  storeName?: string;
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
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [fetchedMeta, setFetchedMeta] = useState<Record<
    string,
    unknown
  > | null>(null);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    const id = product?.id;
    if (!id) return;
    let cancelled = false;
    const params = new URLSearchParams({ id });
    if (product?.storeName) params.set("store", product.storeName);
    fetch(`/chat/api/product-detail?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d?.metadata) setFetchedMeta(d.metadata);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.storeName]);

  const numericPrice = parsePrice(product?.price ?? 0);
  const variants = useMemo(() => {
    if (!product) return [];

    const meta = {
      ...(product.metadata || {}),
      ...(fetchedMeta || {}),
    } as Record<string, unknown>;
    const raw =
      meta.colorSizeStock ||
      meta.color_size_stock ||
      product.colorSizeStock ||
      product.color_size_stock ||
      meta.sizeStock ||
      meta.size_stock ||
      product.sizeStock ||
      product.size_stock;

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        const rows = parsed
          .map((item) => ({
            color: String(item?.color || "").trim(),
            size: String(item?.size || "").trim(),
            stock: Math.max(0, Number(item?.stock) || 0),
          }))

          .filter((item) => item.size);
        if (rows.length > 0) return rows;
      }
    } catch {}

    // metadata.sizes массив байгаа ч размер тус бүрийн бодит үлдэгдэлгүй тул
    // бүгдийг ДУУССАН (stock 0) болгоно — худалдагч жинхэнэ размер/үлдэгдлээ
    // оруулж байж л зарагдана.
    const sizesArr = meta.sizes;
    if (Array.isArray(sizesArr) && sizesArr.length > 0) {
      return sizesArr
        .map((s) => String(s).trim())
        .filter(Boolean)
        .map((size) => ({ color: "", size, stock: 0 }));
    }

    // Размерийн мэдээлэл огт байхгүй бараанд төрлөөр нь размер харуулна, гэхдээ
    // бодит per-размер үлдэгдэлгүй тул бүгдийг ДУУССАН (stock 0) гэж тэмдэглэнэ.
    const text = `${product.name} ${String(meta.category || "")} ${String(
      meta.brand || "",
    )}`.toLowerCase();
    const isShoe =
      /gutal|puuz|пүүз|гутал|shoe|sneaker|boot|air force|air max|jordan|p-6000|adistar|yeezy|dunk|nike|adidas|new balance|sb |footwear/.test(
        text,
      );
    const isClothing =
      /camc|цамц|tsamts|hoodie|shirt|sorochk|сорочк|jacket|куртк|өмд|omd|trouser|jean|нэхий|пальто|coat|tops|малгай|cap|hat|sweater|пиджак/.test(
        text,
      );
    const defaultSizes = isShoe
      ? ["38", "39", "40", "41", "42", "43", "44", "45"]
      : isClothing
        ? ["M", "L", "XL", "2XL", "3XL"]
        : [];
    if (defaultSizes.length > 0) {
      return defaultSizes.map((size) => ({ color: "", size, stock: 0 }));
    }

    return [];
  }, [product, fetchedMeta]);

  const hasColors = variants.some((variant) => variant.color);
  const colors = useMemo(
    () =>
      Array.from(new Set(variants.map((variant) => variant.color))).filter(
        Boolean,
      ),
    [variants],
  );

  const activeColor = !hasColors
    ? ""
    : colors.includes(selectedColor)
      ? selectedColor
      : colors.length === 1
        ? colors[0]
        : "";
  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter((variant) =>
              hasColors ? variant.color === activeColor : true,
            )
            .map((variant) => variant.size),
        ),
      ),
    [activeColor, variants, hasColors],
  );

  const activeSize = availableSizes.includes(selectedSize) ? selectedSize : "";
  const selectedVariant = variants.find(
    (variant) =>
      (hasColors ? variant.color === activeColor : true) &&
      variant.size === activeSize,
  );
  const maxQuantity =
    selectedVariant?.stock ?? Number(product?.metadata?.stock || 0);

  const needsColor = hasColors && colors.length > 1;
  const needsSize = availableSizes.length > 0;
  const selectionComplete =
    variants.length === 0 ||
    ((!needsColor || !!activeColor) && (!needsSize || !!activeSize));

  if (!product) return null;

  const stockForVariant = (color: string, size: string) =>
    variants.find(
      (v) => (hasColors ? v.color === color : true) && v.size === size,
    )?.stock ?? 0;

  const handleAddCart = async () => {
    if (!selectionComplete) {
      setShowSizeWarning(true);
      return;
    }
    if (
      variants.length > 0 &&
      (!selectedVariant || selectedVariant.stock < quantity)
    ) {
      setShowSizeWarning(true);
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

  return createPortal(
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
                <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {needsColor && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                        Өнгө:{" "}
                        <span className="text-white">
                          {activeColor || "сонгоно уу"}
                        </span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => {
                          const active = color === activeColor;
                          return (
                            <button
                              key={color}
                              onClick={() => {
                                setSelectedColor(color);
                                setSelectedSize("");
                                setQuantity(1);
                                setShowSizeWarning(false);
                              }}
                              className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                                active
                                  ? "border-[#9f8cff] bg-[#9f8cff]/20 text-white"
                                  : "border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/5"
                              }`}
                            >
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {needsSize && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                          Размер:{" "}
                          <span className="text-white">
                            {activeSize || "сонгоно уу"}
                          </span>
                        </span>
                        <button
                          onClick={() => setShowSizeGuide((v) => !v)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b7a6ff] transition-colors hover:text-white"
                        >
                          <Ruler size={14} />
                          Хэмжээний заавар
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const active = size === activeSize;
                          const soldOut =
                            stockForVariant(activeColor, size) <= 0;
                          return (
                            <button
                              key={size}
                              disabled={soldOut}
                              onClick={() => {
                                setSelectedSize(size);
                                setQuantity(1);
                                setShowSizeWarning(false);
                              }}
                              className={`relative min-w-[3.25rem] rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                                active
                                  ? "border-[#9f8cff] bg-[#9f8cff]/20 text-white"
                                  : "border-white/15 text-slate-200 hover:border-white/30 hover:bg-white/5"
                              } ${soldOut ? "cursor-not-allowed opacity-30 line-through" : ""}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {showSizeGuide && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
                              <table className="w-full text-xs">
                                <thead className="bg-white/5 text-slate-400">
                                  <tr>
                                    <th className="px-3 py-2 text-left">
                                      Размер
                                    </th>
                                    <th className="px-3 py-2 text-left">
                                      Цээж (см)
                                    </th>
                                    <th className="px-3 py-2 text-left">
                                      Урт (см)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {SIZE_GUIDE.map((row) => (
                                    <tr
                                      key={row.size}
                                      className="border-t border-white/5"
                                    >
                                      <td className="px-3 py-2 font-bold text-white">
                                        {row.size}
                                      </td>
                                      <td className="px-3 py-2 text-slate-300">
                                        {row.chest}
                                      </td>
                                      <td className="px-3 py-2 text-slate-300">
                                        {row.length}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {needsSize &&
                  availableSizes.every(
                    (s) => stockForVariant(activeColor, s) <= 0,
                  ) ? (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-300">
                      <AlertCircle size={15} />
                      Энэ бараа дууссан байна
                    </div>
                  ) : activeSize ? (
                    <p className="text-xs font-bold text-slate-300">
                      Энэ сонголтын үлдэгдэл: {selectedVariant?.stock ?? 0}{" "}
                      ширхэг
                    </p>
                  ) : showSizeWarning ? (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-300">
                      <AlertCircle size={15} />
                      Та размер мэдээллээ сонгоно уу
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Худалдан авахын тулд эхлээд сонголтоо хийнэ үү
                    </p>
                  )}
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

              <Reviews productId={product.id || product.name || "product"} />
            </div>
          </div>

          <Footer
            product={product}
            quantity={quantity}
            numericPrice={numericPrice}
            isAdding={isAdding}
            onBuy={(name, price) => {
              if (!selectionComplete) {
                setShowSizeWarning(true);
                return;
              }
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
    document.body,
  );
}
