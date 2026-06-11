"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  ShoppingBag,
  ImageIcon,
  Check,
  Store,
  Box,
  Tag,
} from "lucide-react";
import { useState, useMemo, type MouseEvent } from "react";
import { useTheme } from "next-themes";

type ProductCardData = {
  id?: string;
  name?: string;
  product_name?: string;
  brand?: string;
  storeName?: string;
  store_name?: string;
  stock?: number;
  price?: string | number;
  formatted_price?: string | number;
  image?: string;
  metadata?: {
    name?: string;
    product_name?: string;
    brand?: string;
    store_name?: string;
    stock?: number;
    price?: string | number;
    formatted_price?: string | number;
    product_image_url?: string;
    image_url?: string;
    description?: string;
  } & Record<string, unknown>;
  product_image_url?: string;
  image_url?: string;
  description?: string;
  [key: string]: unknown;
};

type ProductCardProps = {
  product: ProductCardData;
  isCurrent?: boolean;
  onSelect?: (product: ProductCardData) => void;
  onSave?: (product: ProductCardData) => void;
  onOrder?: () => void;
  onAddToCart?: (product: ProductCardData) => void;
  savedIds?: string[];
  layout?: "stack" | "grid";
};

export const ProductCard = ({
  product,
  isCurrent,
  onSelect,
  onSave,
  onOrder,
  onAddToCart,
  savedIds,
  layout = "stack",
}: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLightMode = resolvedTheme === "light";

  const asText = (value: unknown) =>
    typeof value === "string"
      ? value.trim()
      : value == null
        ? ""
        : String(value).trim();

  const productData = useMemo(() => {
    const meta = (product.metadata || {}) as NonNullable<
      ProductCardData["metadata"]
    >;
 
    return {
      id: asText(product.id ?? product.product_id ?? product.name) || undefined,
      name:
        asText(meta.name) ||
        asText(product.product_name) ||
        asText(product.name) ||
        "Нэргүй бараа",
      brand: asText(product.brand) || asText(meta.brand) || "",
      storeId:
        asText(product.storeId) ||
        asText(product.store_id) ||
        asText(meta.storeId) ||
        asText(meta.store_id) ||
        "",
      storeName:
        asText(product.storeName) ||
        asText(product.store_name) ||
        asText(meta.store_name) ||
        "Turuu's shop",
      stock: meta.stock ?? product.stock,
      price: meta.price ?? product.price ?? product.formatted_price ?? 0,
    };
  }, [product]);

  const imageUrl = useMemo(() => {
    const rawImage =
      product.metadata?.product_image_url ||
      product.product_image_url ||
      product.metadata?.image_url ||
      product.image;

    return rawImage && String(rawImage).startsWith("http")
      ? String(rawImage)
      : null;
  }, [product]);
 
  const productWithImage = {
    ...product,
    ...productData,
    image: imageUrl || product.image,
  };
 
  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
 
    if (isSharing) return;
 
    const shareUrl = `${window.location.origin}/product/${productData.id}`;
    const shareData = {
      title: productData.name,
      text: `${productData.name} - Хамгийн ухаалаг AI дэлгүүрээс сонирхоорой!`,
      url: shareUrl,
    };
 
    try {
      setIsSharing(true);
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    } finally {
      setIsSharing(false);
    }
  };
 
  return (
    <div
      onClick={() => onSelect?.(productWithImage)}
      className={`group relative mx-auto flex flex-col overflow-hidden rounded-[2.25rem] border transition-all duration-500 ${
        layout === "grid"
          ? isLightMode
            ? "h-full w-full min-h-[470px] border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)] hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_0_0_1px_rgba(159,140,255,0.12),0_18px_50px_rgba(15,23,42,0.14),0_0_44px_rgba(159,140,255,0.12)]"
            : "h-full w-full min-h-[470px] border-white/10 bg-[#141827] shadow-[0_18px_40px_rgba(0,0,0,0.28)] hover:-translate-y-1 hover:border-[#9f8cff]/40 hover:shadow-[0_0_0_1px_rgba(159,140,255,0.16),0_18px_50px_rgba(0,0,0,0.36),0_0_44px_rgba(159,140,255,0.18)]"
          : `h-125 w-72 md:w-[320px] ${
              isCurrent
                ? "border-[#9f8cff] shadow-[0_20px_50px_rgba(159,140,255,0.28)]"
                : "border-white/5"
            }`
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(159,140,255,0.18),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -inset-10 bg-[#9f8cff]/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-70" />

      <div
        className={`relative w-full overflow-hidden shrink-0 ${
          layout === "grid"
            ? isLightMode
              ? "aspect-[4/3] bg-slate-50"
              : "aspect-[4/3] bg-[#0b1020]"
            : "h-65"
        }`}
      >
        {imageUrl && !imgError ? (
          <img
            onPointerDown={(e) => e.stopPropagation()}
            src={imageUrl}
            alt={productData.name}
            className={`h-full w-full select-none object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105 ${
              layout === "grid"
                ? isLightMode
                  ? "contrast-100 saturate-100"
                  : "contrast-105 saturate-90"
                : ""
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`h-full w-full flex flex-col items-center justify-center cursor-pointer ${
              isLightMode ? "bg-slate-50" : "bg-white/5"
            }`}
            onClick={() => onSelect?.(productWithImage)}
          >
            <ImageIcon
              className={isLightMode ? "text-slate-300 mb-2" : "text-white/20 mb-2"}
              size={40}
            />
            <span className={isLightMode ? "text-slate-400 text-[10px]" : "text-white/30 text-[10px]"}>
              Зураггүй
            </span>
          </div>
        )}
 
        {layout === "grid" ? (
          <div className={`absolute left-4 top-4 z-20 rounded-[1.1rem] rounded-tl-[0.35rem] px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.22)] border backdrop-blur-md ${
            isLightMode
              ? "bg-white/95 border-slate-200 text-slate-700"
              : "bg-[#252a3a]/90 border-white/10"
          }`}>
            <div className={`text-[12px] font-medium ${isLightMode ? "text-slate-700" : "text-white/80"}`}>
              {productData.brand || "Category"}
            </div>
          </div>
        ) : (
          productData.brand && (
            <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1">
              <Tag size={12} className="text-[#d8c9ff]" />
              <span className="text-white text-[10px] font-medium">
                {productData.brand}
              </span>
            </div>
          )
        )}

        <div className="absolute top-4 right-4 z-20">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSave?.(product);
            }}
            className={`p-3 rounded-full backdrop-blur-md border active:scale-95 transition-all ${
              layout === "grid"
                ? isLightMode
                  ? "bg-white/90 border-slate-200 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.12)] hover:bg-slate-50"
                  : "bg-[#141b2e]/90 border-white/10 text-white/70 shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-[#1a2238]"
                : "bg-black/40 border-white/10 text-white"
            }`}
          >
            <Heart
              size={18}
              className={
                savedIds?.includes(productData.id ?? "")
                  ? "text-red-400 fill-red-400"
                  : layout === "grid"
                    ? isLightMode
                      ? "text-slate-600"
                      : "text-white/70"
                    : "text-white"
              }
            />
          </button>
        </div>

        {layout !== "grid" && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
        )}
      </div>
 
      <div
        className={`flex flex-col flex-1 justify-between ${
          layout === "grid"
            ? isLightMode
              ? "bg-white px-6 pb-6 pt-6 text-slate-900"
              : "bg-[#161b2a] px-6 pb-6 pt-6 text-white"
            : "bg-[#121212] p-6"
        }`}
      >
        <div className={`space-y-2 ${layout === "grid" ? "space-y-3" : ""}`}>
          <div className="flex justify-between items-center">
            <div className={`flex items-center gap-1.5 ${layout === "grid" ? (isLightMode ? "text-slate-500" : "text-white/55") : "text-white/50"}`}>
              <Store size={14} className={isLightMode ? "text-violet-500" : "text-[#c9b7ff]"} />
              <span className="text-[11px] font-bold uppercase tracking-wider line-clamp-1">
                {productData.storeName}
              </span>
            </div>
            {productData.stock !== undefined && (
              <div className={`flex items-center gap-1 ${layout === "grid" ? (isLightMode ? "text-slate-400" : "text-white/40") : "text-white/40"}`}>
                <Box size={12} />
                <span className="text-[10px]">Нөөц: {productData.stock}</span>
              </div>
            )}
          </div>
 
          <div className="flex items-start justify-between gap-4">
            <h3 className={`font-extrabold leading-tight line-clamp-2 ${layout === "grid" ? (isLightMode ? "text-[18px] text-slate-900" : "text-[18px] text-white") : "text-lg text-white"}`}>
              {productData.name}
            </h3>
            <div className={`shrink-0 rounded-full px-4 py-2 text-[15px] font-medium ${layout === "grid" ? (isLightMode ? "bg-violet-500 text-white shadow-[0_10px_18px_rgba(139,123,255,0.20)]" : "bg-[#8b7bff] text-white shadow-[0_10px_18px_rgba(139,123,255,0.25)]") : "bg-[#d9ccff] text-black"}`}>
              {(() => {
                const numericPrice = parseFloat(
                  String(productData.price).replace(/[^0-9.]/g, ""),
                );
                return isNaN(numericPrice) || numericPrice === 0
                  ? "Үнэгүй"
                  : `₮${numericPrice.toLocaleString()}`;
              })()}
            </div>
          </div>

          {layout === "grid" && (
            <p className={`line-clamp-2 text-[13px] leading-5 ${isLightMode ? "text-slate-600" : "text-white/62"}`}>
              {product.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-0.5">
            {[
              productData.brand || "Tag A",
              productData.storeName || "Tag B",
            ]
              .filter(Boolean)
              .slice(0, 2)
              .map((tag, index) => (
                <span
                  key={`${String(tag)}-${index}`}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium border ${
                    isLightMode
                      ? "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-white/6 text-white/72 border-white/8"
                  }`}
                >
                  {String(tag)}
                </span>
              ))}
          </div>
        </div>

        <div className={`mt-5 ${layout === "grid" ? "h-auto" : "h-13"}`}>
          <AnimatePresence mode="wait">
            {(layout === "grid" || isCurrent) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2"
              >
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (layout === "grid") {
                      onAddToCart?.(productWithImage);
                      return;
                    }
                    if (onOrder) onOrder();
                  }}
                  className={`flex-1 h-14 rounded-[1.2rem] font-black active:scale-95 transition-all text-sm disabled:opacity-50 ${
                    layout === "grid"
                      ? isLightMode
                        ? "bg-gradient-to-br from-[#8b7bff] to-[#6f7bff] text-white shadow-[0_14px_24px_rgba(111,123,255,0.20)] hover:brightness-105"
                        : "bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white shadow-[0_14px_24px_rgba(111,123,255,0.25)] hover:brightness-105"
                      : "bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] text-white shadow-[0_8px_20px_rgba(111,123,255,0.25)]"
                  }`}
                  disabled={productData.stock === 0}
                >
                  {layout === "grid" ? (
                    <span className="inline-flex items-center gap-2">
                      <ShoppingBag size={16} />
                      Add To Cart
                    </span>
                  ) : productData.stock === 0 ? "Дууссан" : "Захиалах"}
                </button>

                {layout !== "grid" && (
                  <>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onAddToCart?.(productWithImage);
                      }}
                      className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all hover:bg-white/10"
                    >
                      <ShoppingBag size={18} />
                    </button>

                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={handleShare}
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                        isShared
                          ? "bg-green-500/20 border-green-500 text-green-500"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      {isShared ? <Check size={18} /> : <Share2 size={18} />}
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
 
 
