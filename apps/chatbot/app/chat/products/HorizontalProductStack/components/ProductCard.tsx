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
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/app/chat/hooks/useCart";
 
export const ProductCard = ({
  product,
  isCurrent,
  onSelect,
  onSave,
  onOrder,
  onAddToCart,
  savedIds,
}: any) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { addToCart } = useCart();
 
  const productData = useMemo(() => {
    const meta = product.metadata || {};
 
    return {
      id: product.id ?? product.product_id ?? product.name,
      name: meta.name || product.product_name || product.name || "Нэргүй бараа",
      brand: product.brand || meta.brand || "",
      storeName:
        product.storeName?.trim() ||
        product.store_name?.trim() ||
        meta.store_name?.trim() ||
        "Turuu's shop",
      stock: meta.stock ?? product.stock,
      price: meta.price ?? product.price ?? product.formatted_price ?? 0,
    };
  }, [product]);
 
  useEffect(() => {
    const rawImage =
      product.metadata?.product_image_url ||
      product.product_image_url ||
      product.metadata?.image_url ||
      product.image;
 
    if (rawImage && String(rawImage).startsWith("http")) {
      setImageUrl(rawImage);
    } else {
      setImageUrl(null);
    }
    setImgError(false);
  }, [product]);
 
  const productWithImage = {
    ...product,
    ...productData,
    image: imageUrl || product.image,
  };
 
  const handleShare = async (e: React.MouseEvent) => {
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
    } catch (err: any) {
      if (err.name !== "AbortError") console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };
 
  return (
    <div
      className={`relative mx-auto flex flex-col h-125 w-72 md:w-[320px] overflow-hidden rounded-[2.5rem] bg-[#121212] border transition-all duration-700 ${
        isCurrent
          ? "border-[#077eef] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          : "border-white/5"
      }`}
    >
      <div className="relative h-65 w-full overflow-hidden shrink-0">
        {imageUrl && !imgError ? (
          <img
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSelect?.(productWithImage)}
            src={imageUrl}
            alt={productData.name}
            className="h-full w-full object-cover select-none cursor-pointer hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="h-full w-full flex flex-col items-center justify-center bg-white/5 cursor-pointer"
            onClick={() => onSelect?.(productWithImage)}
          >
            <ImageIcon className="text-white/20 mb-2" size={40} />
            <span className="text-white/10 text-[10px]">Зураггүй</span>
          </div>
        )}
 
        {productData.brand && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1">
            <Tag size={12} className="text-[#C5A059]" />
            <span className="text-white text-[10px] font-medium">
              {productData.brand}
            </span>
          </div>
        )}
 
        <div className="absolute top-4 right-4 z-20">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSave?.(product);
            }}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 active:scale-95 transition-all"
          >
            <Heart
              size={18}
              className={
                savedIds?.includes(productData.id)
                  ? "text-red-500 fill-red-500"
                  : "text-white"
              }
            />
          </button>
        </div>
      </div>
 
      <div className="flex flex-col flex-1 p-6 justify-between bg-[#121212]">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-white/50">
              <Store size={14} className="text-[#077eef]" />
              <span className="text-[11px] font-bold uppercase tracking-wider line-clamp-1">
                {productData.storeName}
              </span>
            </div>
            {productData.stock !== undefined && (
              <div className="flex items-center gap-1 text-white/40">
                <Box size={12} />
                <span className="text-[10px]">Нөөц: {productData.stock}</span>
              </div>
            )}
          </div>
 
          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">
            {productData.name}
          </h3>
 
          <p className="text-blue-300 text-2xl font-black">
            {(() => {
              const numericPrice = parseFloat(
                String(productData.price).replace(/[^0-9.]/g, ""),
              );
              return isNaN(numericPrice) || numericPrice === 0
                ? "Үнэгүй"
                : numericPrice.toLocaleString() + "₮";
            })()}
          </p>
        </div>
 
        <div className="h-13 mt-4">
          <AnimatePresence mode="wait">
            {isCurrent && (
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
                    if (onOrder) onOrder();
                  }}
                  className="flex-1 h-12 bg-[#077eef] rounded-2xl text-white font-bold active:scale-95 transition-all text-sm disabled:opacity-50"
                  disabled={productData.stock === 0}
                >
                  {productData.stock === 0 ? "Дууссан" : "Захиалах"}
                </button>
 
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onAddToCart?.(productWithImage);
                  }}
                  className="bg-white/5 text-white h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
 
 