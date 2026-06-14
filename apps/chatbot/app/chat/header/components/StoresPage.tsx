"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// Local type definitions to avoid an external ../types import
type ActiveView = "stores" | "detail" | "cart";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  inStock?: boolean;
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

type CartItem = {
  product: Product;
  store: Store;
  qty: number;
};

export default function StoresPage() {
  const [view, setView] = useState<ActiveView>("stores");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);

  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setStoresLoading(true);
    setStoresError(null);
    try {
      const res = await fetch("/store/api/get-store");
      const text = await res.text();
      if (text.trim().startsWith("<"))
        throw new Error(`/store/api/get-store route олдсонгүй (${res.status})`);
      const data = JSON.parse(text);
      if (!res.ok)
        throw new Error(data.error ?? "Дэлгүүр татахад алдаа гарлаа");
      setStores(data.stores ?? []);
    } catch (e: any) {
      setStoresError(e.message ?? "Алдаа гарлаа");
    } finally {
      setStoresLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedStore) return;
    fetchProducts(selectedStore.name);
  }, [selectedStore]);

  async function fetchProducts(storeName: string) {
    setProductsLoading(true);
    setProductsError(null);
    setStoreProducts([]);
    try {
      const res = await fetch(
        `/store/api/productAllGet?storeName=${encodeURIComponent(storeName)}`,
      );
      const text = await res.text();
      if (text.trim().startsWith("<"))
        throw new Error("Бараа татах route олдсонгүй");
      const data = JSON.parse(text);
      if (!data.success) throw new Error(data.error || "Алдаа гарлаа");
      const mapped: Product[] = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name ?? "Нэргүй бараа",
        price: Number(p.price ?? 0),
        image: p.image ?? "/placeholder.png",
        category: p.category ?? "Бусад",
        inStock: Number(p.stock ?? 1) > 0,
      }));
      setStoreProducts(mapped);
    } catch (e: any) {
      setProductsError(e.message ?? "Алдаа гарлаа");
    } finally {
      setProductsLoading(false);
    }
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  function addToCart(product: Product, store: Store) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { product, store, qty: 1 }];
    });
    showToast(`${product.name} сагсанд нэмэгдлээ`);
  }

  // Сагснаас устгах
  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  // Тоо ширхэг өөрчлөх
  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i,
      ),
    );
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function goToStores() {
    setView("stores");
    setSelectedStore(null);
    setStoreProducts([]);
  }

  function goToDetail(store: Store) {
    setSelectedStore(store);
    setView("detail");
  }

  function goToCart() {
    setView("cart");
  }

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex-1 flex flex-col font-sans text-2xl text-white select-none rounded-2xl ">
      {/* ── INTERNAL HEADER ── */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/5 backdrop-blur-md sticky top-0 z-70 gap-2">
        <div className="min-w-18">
          {view !== "stores" ? (
            <button
              className="bg-none border-none text-[#9f8cff] cursor-pointer text-xs font-bold whitespace-nowrap p-0 hover:underline"
              onClick={
                view === "cart"
                  ? () => setView(selectedStore ? "detail" : "stores")
                  : goToStores
              }
            >
              ← Буцах
            </button>
          ) : (
            <div className="font-black text-sm tracking-tight">
              Chat{" "}
              <span className="bg-[#7c5cff] rounded px-1.25 py-px text-[9px] font-bold ml-0.5 text-white uppercase">
                MART
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 font-bold text-xs text-center overflow-hidden text-ellipsis whitespace-nowrap text-white/90">
          {view === "detail" && selectedStore?.name}
          {view === "cart" && "Сагс"}
        </div>

        <button
          className={`bg-white/5 border border-white/10 rounded-lg text-white text-sm px-2.5 py-1.5 relative min-w-9.5 transition-colors ${
            view === "cart" ? "bg-[#7c5cff]/20 border-[#7c5cff]" : ""
          }`}
          onClick={goToCart}
        >
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#7c5cff] rounded-full text-[9px] font-bold px-1.5 py-0.5 text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ── 1. STORES LIST ── */}
        {view === "stores" && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center bg-black/20 border border-white/5 rounded-xl px-3 py-2 gap-2">
                <span className="text-xs opacity-40">🔍</span>
                <input
                  className="bg-transparent border-none outline-none text-white text-xs flex-1 placeholder:text-white/20"
                  placeholder="Дэлгүүр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="text-white text-xs font-bold bg-[#7c5cff]/20 border border-[#7c5cff]/30 px-2.5 py-1.5 rounded-lg">
                {filteredStores.length}
              </div>
            </div>

            {storesLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="w-6 h-6 border-2 border-[#7c5cff]/20 border-t-[#7c5cff] rounded-full animate-spin" />
                <span className="text-white/40 text-xs">
                  Дэлгүүрүүд ачааллаж байна...
                </span>
              </div>
            )}
            {storesError && !storesLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="text-xl">⚠️</div>
                <div className="text-red-400 text-xs">{storesError}</div>
                <button
                  className="bg-red-400/10 border border-red-400/20 rounded-md text-red-400 text-xs font-semibold px-3 py-1.5 mt-1"
                  onClick={fetchStores}
                >
                  Дахин оролдох
                </button>
              </div>
            )}
            {!storesLoading && !storesError && filteredStores.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="text-2xl">🏪</div>
                <p className="text-white/40 text-xs m-0">Дэлгүүр олдсонгүй</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {!storesLoading &&
                !storesError &&
                filteredStores.map((store) => (
                  <motion.div
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                    whileTap={{ scale: 0.99 }}
                    key={store.id}
                    className="bg-white/2 border border-white/4 rounded-xl p-3.5 cursor-pointer transition-all duration-200"
                    onClick={() => goToDetail(store)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl w-9 h-9 flex items-center justify-center bg-white/5 rounded-lg shrink-0">
                        {store.logo ?? "🏪"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs tracking-tight text-white/90">
                          {store.name}
                          {store.isVerified && (
                            <span className="text-[#7c5cff] text-[9px] font-bold">
                              {" "}
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="text-white/35 text-[10px]">
                          {store.category || "Дэлгүүр"}
                        </div>
                      </div>
                      <div className="text-white/25 text-xs shrink-0">→</div>
                    </div>
                    <div className="flex gap-2 text-[10px] text-white/35 border-t border-white/3 pt-2">
                      {(store.rating ?? 0) > 0 && (
                        <span className="text-yellow-400">
                          ⭐ {store.rating ?? 0}
                        </span>
                      )}
                      <span>{store.productCount} бараа</span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* ── 2. STORE DETAIL ── */}
        {view === "detail" && selectedStore && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-2">
              <div className="text-2xl w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 shrink-0">
                {selectedStore.logo ?? "🏪"}
              </div>
              <div>
                <div className="font-bold text-sm text-white/90">
                  {selectedStore.name}
                  {selectedStore.isVerified && (
                    <span className="text-[#7c5cff] text-[9px] font-bold">
                      {" "}
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-white/45 text-[10px] flex gap-1 items-center">
                  {(selectedStore.rating ?? 0) > 0 && (
                    <>
                      <span className="text-yellow-400">
                        ⭐ {selectedStore.rating ?? 0}
                      </span>
                      <span className="mx-0.5">·</span>
                    </>
                  )}
                  <span>{selectedStore.productCount} бараа</span>
                </div>
              </div>
            </div>

            {totalItems > 0 && (
              <button
                className="w-full flex justify-between items-center bg-[#7c5cff] border-none rounded-xl text-white cursor-pointer text-xs font-bold p-3 mb-2 shadow-lg shadow-[#7c5cff]/20 active:scale-[0.98] transition-transform"
                onClick={goToCart}
              >
                <span>🛒 {totalItems} бараа сонгосон</span>
                <span className="font-extrabold">
                  {totalPrice.toLocaleString()}₮ →
                </span>
              </button>
            )}

            {productsLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="w-6 h-6 border-2 border-[#7c5cff]/20 border-t-[#7c5cff] rounded-full animate-spin" />
                <span className="text-white/45 text-xs">
                  Барааг ачааллаж байна...
                </span>
              </div>
            )}
            {productsError && !productsLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="text-xl">⚠️</div>
                <div className="text-red-400 text-xs">{productsError}</div>
                <button
                  className="bg-red-400/10 border border-red-400/20 rounded-md text-red-400 text-xs font-semibold px-3 py-1.5"
                  onClick={() => fetchProducts(selectedStore.name)}
                >
                  Дахин оролдох
                </button>
              </div>
            )}
            {!productsLoading &&
              !productsError &&
              storeProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <div className="text-2xl">📦</div>
                  <p className="text-white/45 text-xs m-0">Бараа олдсонгүй</p>
                </div>
              )}

            {!productsLoading && !productsError && storeProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {storeProducts.map((product) => {
                  const inCart = cart.find((i) => i.product.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className="bg-white/5 border border-white/5 rounded-xl p-2 flex flex-col"
                    >
                      <div className="w-full h-24 rounded-lg mb-2 overflow-hidden bg-white/4 flex items-center justify-center relative shrink-0">
                        {product.image?.startsWith("http") ||
                        product.image?.startsWith("/") ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{product.image}</span>
                        )}
                        {!product.inStock && (
                          <div className="absolute top-1 right-1 bg-red-400/15 border border-red-400/30 rounded text-[8px] font-bold text-red-400 px-1.5 py-0.5">
                            Дууссан
                          </div>
                        )}
                      </div>

                      <div className="text-[8px] text-white/25 uppercase tracking-wider mb-0.5">
                        {product.category}
                      </div>
                      <div className="font-semibold text-[11px] mb-1.5 line-clamp-2 leading-snug flex-1 text-white/90">
                        {product.name}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-[#9f8cff]">
                          {Number(product.price).toLocaleString()}₮
                        </span>
                        {inCart && (
                          <span className="bg-[#7c5cff]/20 text-[#9f8cff] rounded text-[9px] font-bold px-1 py-0.5">
                            ×{inCart.qty}
                          </span>
                        )}
                      </div>

                      <button
                        className={`w-full text-white border-none rounded-md text-[10px] font-bold py-1.5 cursor-pointer transition-colors ${
                          product.inStock
                            ? "bg-[#7c5cff] hover:bg-[#684be3]"
                            : "bg-white/5 text-white/25 cursor-not-allowed"
                        }`}
                        disabled={!product.inStock}
                        onClick={() => addToCart(product, selectedStore)}
                      >
                        {product.inStock
                          ? inCart
                            ? "Нэмэх +"
                            : "Сагсанд нэмэх"
                          : "Дууссан"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 3. CART ── */}
        {view === "cart" && (
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="text-3xl">🛒</div>
                <p className="text-white/45 text-xs m-0">Сагс хоосон байна</p>
                <button
                  className="bg-[#7c5cff] hover:bg-[#684be3] border-none rounded-lg text-white cursor-pointer text-xs font-bold px-4 py-2 mt-2 transition-colors"
                  onClick={goToStores}
                >
                  Дэлгүүр үзэх
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/5"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
                        {item.product.image?.startsWith("http") ||
                        item.product.image?.startsWith("/") ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-base">
                            {item.product.image}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[11px] mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-white/90">
                          {item.product.name}
                        </div>
                        <div className="text-white/45 text-[9px]">
                          {item.store.name}
                        </div>
                        <div className="text-[#9f8cff] font-bold text-[11px] mt-0.5">
                          {(item.product.price * item.qty).toLocaleString()}₮
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="bg-white/5 border border-white/5 rounded text-white cursor-pointer text-xs w-5 h-5 flex items-center justify-center active:scale-95"
                          onClick={() => updateQty(item.product.id, -1)}
                        >
                          −
                        </button>
                        <span className="text-xs font-bold min-w-3.5 text-center">
                          {item.qty}
                        </span>
                        <button
                          className="bg-white/5 border border-white/5 rounded text-white cursor-pointer text-xs w-5 h-5 flex items-center justify-center active:scale-95"
                          onClick={() => updateQty(item.product.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="bg-none border-none text-red-400 cursor-pointer text-[10px] ml-1 opacity-70 p-1 hover:opacity-100"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center mb-3 text-xs text-white/45">
                    <span>Нийт дүн</span>
                    <span className="text-white font-black text-base">
                      {totalPrice.toLocaleString()}₮
                    </span>
                  </div>
                  <button
                    className="w-full bg-[#7c5cff] hover:bg-[#684be3] border-none rounded-xl text-white cursor-pointer text-xs font-bold py-2.5 shadow-lg shadow-[#7c5cff]/10 active:scale-[0.99] transition-transform"
                    onClick={() => {
                      showToast("Захиалга амжилттай илгээгдлээ!");
                      setCart([]);
                      goToStores();
                    }}
                  >
                    Захиалга өгөх
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── TOAST MESSAGE ── */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#7c5cff] rounded-lg text-white text-[11px] font-bold px-4 py-2 z-99999 whitespace-nowrap shadow-lg shadow-[#7c5cff]/30">
          {toast}
        </div>
      )}
    </div>
  );
}
