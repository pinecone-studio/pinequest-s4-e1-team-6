"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, X, ArrowRight, Store as StoreIcon, ChevronLeft, Plus } from "lucide-react";
import { useCart } from "@/app/context/CartContext"; 

type ActiveView = "stores" | "detail" | "product-detail";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  brand?: string;
  colors?: string[];
  sizes?: string[];
  description?: string;
  metadata?: any;
};

type Store = {
  id: string;
  name: string;
  logo?: string;
  category?: string;
  isVerified?: boolean;
  rating?: number;
  productCount?: number;
};

interface StoresPageProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCartOpen: () => void;
}

export default function StoresPage({ isOpen, setIsOpen, onCartOpen }: StoresPageProps) {
  const [view, setView] = useState<ActiveView>("stores");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { addToCart } = useCart() as any; 

  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStores();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // 1. Дэлгүүрүүдийн жагсаалт татах
  async function fetchStores() {
    setStoresLoading(true);
    try {
      const res = await fetch("/store/api/get-store");
      if (!res.ok) throw new Error("Stores could not be fetched");
      const data = await res.json();
      setStores(data.stores ?? []);
    } catch (e) {
      console.error("Error fetching stores:", e);
      setStores([]);
    } finally {
      setStoresLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedStore) return;
    fetchProducts(selectedStore.name);
  }, [selectedStore]);

  // 2. Сонгосон дэлгүүрийн бүх барааг татах
  async function fetchProducts(storeName: string) {
    setProductsLoading(true);
    try {
      const res = await fetch(`/store/api/productAllGet?storeName=${encodeURIComponent(storeName)}`);
      
      if (!res.ok) {
        console.warn("Product list API error or not found.");
        setStoreProducts([]);
        return;
      }
      
      const data = await res.json();
      if (data.success && data.products) {
        const mapped: Product[] = data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price || 0),
          image: p.image, 
          category: p.category,
          // Хэрэв дата дээр үлдэгдэл байхгүй бол харуулах зорилгоор 10 гэж тавилаа, та өөрийн логикоор сольж болно
          stock: p.stock !== undefined ? Number(p.stock) : 10,
          brand: p.brand,
          metadata: p.metadata
        }));
        setStoreProducts(mapped);
      } else {
        setStoreProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setStoreProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }

// StoresPage.tsx доторх handleProductClick функцийг ингэж өөрчил:
const handleProductClick = async (product: Product) => {
    setView("product-detail");
    setDetailLoading(true);
    setSelectedProduct(product); 
    
    try {
      const storeName = selectedStore?.name || "";
      // ⚠️ ЗАМЫГ ЗӨВ БОЛГОВ
      const res = await fetch(`/chat/api/product-detail?id=${encodeURIComponent(product.id)}&store=${encodeURIComponent(storeName)}`);
      
      if (!res.ok) throw new Error("API алдаа");
      
      const data = await res.json();

      if (data.found && data.metadata) {
        const meta = data.metadata;
        setSelectedProduct({
          ...product,
          name: meta.name || product.name,
          price: Number(meta.price || product.price),
          image: meta.image || product.image || "https://avatar.iran.liara.run/public/shop",
          description: meta.description || "",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setDetailLoading(false);
    }
};

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    setView("detail");
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) return; // Дууссан бол сагслахгүй
    if (addToCart) addToCart(product);
  };

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/10 dark:bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ x: "100%", opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="relative w-full sm:w-[460px] h-screen bg-white/40 dark:bg-[#090d22]/85 backdrop-blur-3xl border-l border-white/20 dark:border-white/10 flex flex-col font-sans text-neutral-900 dark:text-white select-none shadow-[-20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.4)]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-200/40 dark:border-white/10 bg-white/20 dark:bg-white/[0.01]">
              <div className="flex items-center gap-2">
                {view === "product-detail" ? (
                  <button 
                    className="flex items-center gap-1 text-neutral-600 dark:text-slate-400 hover:text-[#7c5cff] dark:hover:text-[#9f8cff] text-xs font-bold bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-white/40 dark:border-white/5 transition-all active:scale-95"
                    onClick={() => setView("detail")}
                  >
                    <ChevronLeft className="w-4 h-4" /> Бараанууд
                  </button>
                ) : view === "detail" ? (
                  <button 
                    className="flex items-center gap-1 text-neutral-600 dark:text-slate-400 hover:text-[#7c5cff] dark:hover:text-[#9f8cff] text-xs font-bold bg-white/60 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-white/40 dark:border-white/5 transition-all active:scale-95"
                    onClick={() => setView("stores")}
                  >
                    <ChevronLeft className="w-4 h-4" /> Дэлгүүрүүд
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-5 h-5 text-[#7c5cff]" />
                    <span className="font-black text-base tracking-tight">Сонгох дэлгүүрүүд</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  className="flex items-center gap-1.5 bg-[#7c5cff]/10 dark:bg-[#7c5cff]/20 hover:bg-[#7c5cff]/20 dark:hover:bg-[#7c5cff]/30 border border-[#7c5cff]/20 rounded-xl text-[#7c5cff] dark:text-white text-xs font-black px-3.5 py-1.5 transition-all active:scale-95"
                  onClick={onCartOpen}
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Сагс
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl text-neutral-500 dark:text-slate-400 p-2 hover:text-neutral-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              
              {/* VIEW 1: STORES LIST */}
              {view === "stores" && (
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-[#7c5cff]/40 transition-colors shadow-inner">
                    <Search className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                    <input 
                      className="bg-transparent border-none outline-none text-neutral-900 dark:text-white text-sm flex-1 placeholder:text-neutral-400 dark:placeholder:text-slate-500" 
                      placeholder="Дэлгүүрийн нэр хайх..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    {storesLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7c5cff] border-t-transparent mb-2" />
                        <div className="text-xs">Уншиж байна...</div>
                      </div>
                    ) : filteredStores.length === 0 ? (
                      <div className="text-center py-20 text-neutral-500 dark:text-slate-500 text-sm">Дэлгүүр олдсонгүй</div>
                    ) : (
                      filteredStores.map((store, idx) => (
                        <motion.div 
                          key={store.id || store.name} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => handleStoreClick(store)} 
                          className="group relative bg-white/60 dark:bg-white/[0.02] hover:bg-white/90 dark:hover:bg-white/[0.05] border border-white/40 dark:border-white/5 hover:border-[#7c5cff]/30 dark:hover:border-white/10 rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-px active:scale-[0.99] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gradient-to-br dark:from-white/10 dark:to-white/[0.02] border border-neutral-200/60 dark:border-white/10 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                            {(store as any).logoUrl ? (
                              <img 
                                src={(store as any).logoUrl} 
                                alt={store.name} 
                                className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }} 
                              />
                            ) : (
                                <span className="text-2xl">{store.logo ?? ""}</span>
                                 )}
                          </div>
                            <div>
                              <div className="text-sm font-bold text-neutral-950 dark:text-white group-hover:text-[#7c5cff] dark:group-hover:text-[#9f8cff] transition-colors">{store.name}</div>
                              <div className="text-[10px] font-bold text-neutral-400 dark:text-slate-400 mt-1 tracking-wider uppercase">{store.category || "Дэлгүүр"}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: PRODUCTS GRID */}
              {view === "detail" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-white/[0.02] border border-white/40 dark:border-white/5 rounded-2xl p-3">
                    <div className="text-2xl">{selectedStore?.logo ?? "🏪"}</div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{selectedStore?.name}</h3>
                      <p className="text-[10px] text-neutral-400 dark:text-slate-400">Бүх бараа бүтээгдэхүүн</p>
                    </div>
                  </div>

                  {productsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7c5cff] border-t-transparent mb-2" />
                      <div className="text-xs">Барааг татаж байна...</div>
                    </div>
                  ) : storeProducts.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500 dark:text-slate-500 text-sm">Бараа олдсонгүй.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {storeProducts.map((product, idx) => {
                        const isOutOfStock = product.stock !== undefined && product.stock <= 0;

                        return (
                          <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => handleProductClick(product)} 
                            className="group flex flex-col justify-between bg-white/60 dark:bg-white/[0.02] hover:bg-white/90 dark:hover:bg-white/[0.05] border border-white/40 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 rounded-2xl p-3 space-y-2.5 transition-all duration-200 cursor-pointer"
                          >
                            <div className="space-y-2">
                              {/* Зураг болон Дууссан маск */}
                              <div className="relative w-full h-28 bg-white dark:bg-black/20 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200/40 dark:border-white/5">
                                <img 
                                  src={product.image} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                  onError={(e)=>{(e.target as HTMLImageElement).src='/placeholder.png'}} 
                                  alt={product.name}
                                />
                                {/* Хэрэв дууссан бол маск харуулна */}
                                {isOutOfStock && (
                                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="bg-black/60 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase border border-white/10">
                                      Дууссан
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5 px-0.5">
                                <div className="text-[11px] font-bold text-neutral-800 dark:text-slate-200 line-clamp-1">{product.name}</div>
                                <div className="text-[#7c5cff] dark:text-[#9f8cff] text-xs font-black">{product.price.toLocaleString()} ₮</div>
                              </div>
                            </div>

                            {/* Сагслах товчлуур */}
                            <button
                              disabled={isOutOfStock}
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleAddToCart(product);
                              }}
                              className={`w-full mt-2 flex items-center justify-center gap-1 text-white rounded-xl py-2 text-[10px] font-black tracking-wide transition-all ${
                                isOutOfStock 
                                  ? "bg-neutral-300 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 cursor-not-allowed opacity-50" 
                                  : "bg-[#7c5cff] hover:bg-[#6646eb] active:scale-95"
                              }`}
                            >
                              <Plus className="w-3 h-3" /> Сагслах
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 3: PRODUCT DETAIL VIEW */}
              {view === "product-detail" && selectedProduct && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5 pb-10"
                >
                  <div className="relative w-full h-64 bg-white dark:bg-black/20 rounded-2xl overflow-hidden border border-neutral-200/40 dark:border-white/10">
                    <img 
                      src={selectedProduct.image} 
                      className="w-full h-full object-contain p-2"
                      onError={(e)=>{(e.target as HTMLImageElement).src='/placeholder.png'}}
                      alt={selectedProduct.name}
                    />
                    {selectedProduct.stock !== undefined && selectedProduct.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-black/70 text-white text-xs font-black px-4 py-1.5 rounded-xl tracking-widest uppercase border border-white/10">
                          Дууссан
                        </span>
                      </div>
                    )}
                  </div>

                  {detailLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-60">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7c5cff] border-t-transparent mb-2" />
                      <div className="text-xs">Барааны мэдээллийг уншиж байна...</div>
                    </div>
                  ) : (
                    <div className="space-y-4 px-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 dark:text-slate-400 uppercase tracking-wider">
                        <span>{selectedProduct.brand || selectedStore?.name}</span>
                        <span>{selectedProduct.category}</span>
                      </div>

                      <div className="space-y-1.5">
                        <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white leading-tight">
                          {selectedProduct.name}
                        </h2>
                        <div className="text-lg font-black text-[#7c5cff] dark:text-[#9f8cff]">
                          {selectedProduct.price.toLocaleString()} ₮
                        </div>
                      </div>

                      <hr className="border-neutral-200/50 dark:border-white/5" />

                      {/* Өнгөнүүд */}
                      {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-neutral-500 dark:text-slate-400">Боломжит өнгөнүүд:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedProduct.colors.map((color, i) => (
                              <span key={i} className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg text-neutral-800 dark:text-slate-200">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Хэмжээнүүд */}
                      {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-neutral-500 dark:text-slate-400">Хэмжээ / Размер:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedProduct.sizes.map((size, i) => (
                              <span key={i} className="px-2.5 py-1 text-[11px] font-bold bg-neutral-100 dark:bg-white/10 rounded-lg text-neutral-900 dark:text-white">
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Үлдэгдэл төлөв */}
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {selectedProduct.stock !== undefined && selectedProduct.stock <= 0 ? (
                          <>
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                            <span className="text-neutral-500">Дууссан (Хүлээгдэж буй)</span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-neutral-500 dark:text-slate-400">Бэлэн байгаа</span>
                          </>
                        )}
                      </div>

                      <button
                        disabled={selectedProduct.stock !== undefined && selectedProduct.stock <= 0}
                        onClick={() => handleAddToCart(selectedProduct)}
                        className={`w-full mt-4 flex items-center justify-center gap-2 text-white rounded-2xl py-3 text-xs font-black tracking-wide transition-all ${
                          selectedProduct.stock !== undefined && selectedProduct.stock <= 0
                            ? "bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50 shadow-none"
                            : "bg-[#7c5cff] hover:bg-[#6646eb] active:scale-95 shadow-lg shadow-[#7c5cff]/20"
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" /> Сагсанд нэмэх
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}