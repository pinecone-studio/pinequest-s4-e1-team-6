"use client";
import { useState, useEffect } from "react";
import { Product, Store, CartItem, ActiveView } from "../components/types";

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

  // ── Бүх дэлгүүр татах ───────────────────────────────────────────────────
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

  // ── Дэлгүүрийн бараа татах ───────────────────────────────────────────────
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

  // ── Cart helpers ─────────────────────────────────────────────────────────
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

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

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

  const displayProducts = storeProducts;

  return (
    <div style={styles.page}>
      {/* ── STICKY HEADER ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {view !== "stores" ? (
            <button
              style={styles.headerBack}
              onClick={
                view === "cart"
                  ? () => setView(selectedStore ? "detail" : "stores")
                  : goToStores
              }
            >
              ← Буцах
            </button>
          ) : (
            <div style={styles.logo}>
              Chat <span style={styles.logoMart}>MART</span>
            </div>
          )}
        </div>

        <div style={styles.headerTitle}>
          {view === "detail" && selectedStore?.name}
          {view === "cart" && "Сагс"}
        </div>

        <button
          style={{
            ...styles.cartBtn,
            ...(view === "cart" ? styles.cartBtnActive : {}),
          }}
          onClick={goToCart}
        >
          🛒
          {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
        </button>
      </div>

      {/* ── 1. STORES LIST ── */}
      {view === "stores" && (
        <div style={styles.content}>
          <div style={styles.searchRow}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Дэлгүүр хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={styles.storeCount}>{filteredStores.length}</div>
          </div>

          {storesLoading && (
            <div style={styles.centerWrap}>
              <div style={styles.spinner} />
              <span style={styles.mutedText}>Дэлгүүрүүд ачааллаж байна...</span>
            </div>
          )}
          {storesError && !storesLoading && (
            <div style={styles.centerWrap}>
              <div style={{ fontSize: 28 }}>⚠️</div>
              <div style={styles.errorText}>{storesError}</div>
              <button style={styles.retryBtn} onClick={fetchStores}>
                Дахин оролдох
              </button>
            </div>
          )}
          {!storesLoading && !storesError && filteredStores.length === 0 && (
            <div style={styles.centerWrap}>
              <div style={{ fontSize: 32 }}>🏪</div>
              <p style={styles.mutedText}>Дэлгүүр олдсонгүй</p>
            </div>
          )}

          <div style={styles.storesGrid}>
            {!storesLoading &&
              !storesError &&
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  style={styles.storeCard}
                  onClick={() => goToDetail(store)}
                >
                  <div style={styles.storeCardTop}>
                    <div style={styles.storeCardLogo}>{store.logo ?? "🏪"}</div>
                    <div style={styles.storeCardInfo}>
                      <div style={styles.storeCardName}>
                        {store.name}
                        {store.isVerified && (
                          <span style={styles.verified}> ✓</span>
                        )}
                      </div>
                      <div style={styles.storeCardCat}>
                        {store.category || "Дэлгүүр"}
                      </div>
                    </div>
                    <div style={styles.storeArrow}>→</div>
                  </div>
                  <div style={styles.storeCardBottom}>
                    {store.rating > 0 && (
                      <span style={styles.storeRating}>⭐ {store.rating}</span>
                    )}
                    <span style={styles.storeProdCount}>
                      {store.productCount} бараа
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── 2. STORE DETAIL ── */}
      {view === "detail" && selectedStore && (
        <div style={styles.content}>
          {/* Store hero */}
          <div style={styles.storeHero}>
            <div style={styles.storeHeroLogo}>{selectedStore.logo ?? "🏪"}</div>
            <div>
              <div style={styles.storeHeroName}>
                {selectedStore.name}
                {selectedStore.isVerified && (
                  <span style={styles.verified}> ✓</span>
                )}
              </div>
              <div style={styles.storeHeroMeta}>
                {selectedStore.rating > 0 && (
                  <>
                    <span>⭐ {selectedStore.rating}</span>
                    <span style={styles.dot}>·</span>
                  </>
                )}
                <span>{selectedStore.productCount} бараа</span>
              </div>
            </div>
          </div>

          {/* Cart summary bar — items байвал харуулна */}
          {totalItems > 0 && (
            <button style={styles.cartBar} onClick={goToCart}>
              <span>🛒 {totalItems} бараа сонгосон</span>
              <span style={styles.cartBarPrice}>
                {totalPrice.toLocaleString()}₮ →
              </span>
            </button>
          )}

          {productsLoading && (
            <div style={styles.centerWrap}>
              <div style={styles.spinner} />
              <span style={styles.mutedText}>Барааг ачааллаж байна...</span>
            </div>
          )}
          {productsError && !productsLoading && (
            <div style={styles.centerWrap}>
              <div style={{ fontSize: 28 }}>⚠️</div>
              <div style={styles.errorText}>{productsError}</div>
              <button
                style={styles.retryBtn}
                onClick={() => fetchProducts(selectedStore.name)}
              >
                Дахин оролдох
              </button>
            </div>
          )}
          {!productsLoading &&
            !productsError &&
            displayProducts.length === 0 && (
              <div style={styles.centerWrap}>
                <div style={{ fontSize: 32 }}>📦</div>
                <p style={styles.mutedText}>Бараа олдсонгүй</p>
              </div>
            )}

          {!productsLoading && !productsError && displayProducts.length > 0 && (
            <div style={styles.productsGrid}>
              {displayProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                return (
                  <div key={product.id} style={styles.productCard}>
                    {/* Image */}
                    <div style={styles.productImgWrap}>
                      {product.image?.startsWith("http") ||
                      product.image?.startsWith("/") ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={styles.productImg}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 32 }}>{product.image}</span>
                      )}
                      {!product.inStock && (
                        <div style={styles.outOfStock}>Дууссан</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={styles.productCategory}>{product.category}</div>
                    <div style={styles.productName}>{product.name}</div>

                    <div style={styles.productPriceRow}>
                      <span style={styles.productPrice}>
                        {Number(product.price).toLocaleString()}₮
                      </span>
                      {inCart && (
                        <span style={styles.inCartBadge}>×{inCart.qty}</span>
                      )}
                    </div>

                    <button
                      style={{
                        ...styles.addBtn,
                        ...(!product.inStock ? styles.addBtnDisabled : {}),
                      }}
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
        <div style={styles.content}>
          {cart.length === 0 ? (
            <div style={styles.centerWrap}>
              <div style={{ fontSize: 40 }}>🛒</div>
              <p style={styles.mutedText}>Сагс хоосон байна</p>
              <button style={styles.browsBtn} onClick={goToStores}>
                Дэлгүүр үзэх
              </button>
            </div>
          ) : (
            <>
              <div style={styles.cartItems}>
                {cart.map((item) => (
                  <div key={item.product.id} style={styles.cartItem}>
                    {/* Image */}
                    <div style={styles.cartItemImg}>
                      {item.product.image?.startsWith("http") ||
                      item.product.image?.startsWith("/") ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 22 }}>
                          {item.product.image}
                        </span>
                      )}
                    </div>

                    <div style={styles.cartItemInfo}>
                      <div style={styles.cartItemName}>{item.product.name}</div>
                      <div style={styles.cartItemStore}>{item.store.name}</div>
                      <div style={styles.cartItemPrice}>
                        {(item.product.price * item.qty).toLocaleString()}₮
                      </div>
                    </div>

                    <div style={styles.cartItemControls}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQty(item.product.id, -1)}
                      >
                        −
                      </button>
                      <span style={styles.qtyNum}>{item.qty}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQty(item.product.id, 1)}
                      >
                        +
                      </button>
                      <button
                        style={styles.removeBtn}
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.cartFooter}>
                <div style={styles.cartTotal}>
                  <span>Нийт дүн</span>
                  <span style={styles.totalAmount}>
                    {totalPrice.toLocaleString()}₮
                  </span>
                </div>
                <button
                  style={styles.checkoutBtn}
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

      {toast && <Toast message={toast} />}
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return <div style={styles.toast}>{message}</div>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const c = {
  bg: "#0f1535",
  surface: "rgba(255,255,255,0.06)",
  surfaceHover: "rgba(255,255,255,0.10)",
  border: "rgba(255,255,255,0.10)",
  accent: "#6d7fff",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  danger: "#f87171",
  warning: "#fbbf24",
  green: "#4ade80",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: c.bg,
    fontFamily: "'Inter','Segoe UI',sans-serif",
    color: c.text,
    display: "flex",
    flexDirection: "column",
  },
  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: `1px solid ${c.border}`,
    background: "rgba(15,21,53,0.97)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: 8,
  },
  headerLeft: { minWidth: 72 },
  headerBack: {
    background: "none",
    border: "none",
    color: c.accent,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: 0,
    whiteSpace: "nowrap",
  },
  logo: {
    fontWeight: 800,
    fontSize: 15,
    letterSpacing: "-0.5px",
    color: c.text,
  },
  logoMart: {
    background: c.accent,
    borderRadius: 4,
    padding: "1px 5px",
    fontSize: 9,
    fontWeight: 700,
    marginLeft: 3,
    color: "#fff",
  },
  headerTitle: {
    flex: 1,
    fontWeight: 600,
    fontSize: 14,
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cartBtn: {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    color: c.text,
    cursor: "pointer",
    fontSize: 15,
    padding: "6px 10px",
    position: "relative",
    minWidth: 42,
  },
  cartBtnActive: {
    background: `rgba(109,127,255,0.2)`,
    borderColor: c.accent,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    background: c.accent,
    borderRadius: "50%",
    fontSize: 9,
    fontWeight: 700,
    padding: "1px 4px",
    color: "#fff",
  },
  // Layout
  content: { padding: "14px 12px", flex: 1 },
  centerWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "48px 16px",
    textAlign: "center",
  },
  mutedText: { color: c.muted, fontSize: 13, margin: 0 },
  errorText: { color: c.danger, fontSize: 13 },
  // Search
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    padding: "8px 12px",
    gap: 6,
  },
  searchIcon: { fontSize: 12, opacity: 0.5 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: c.text,
    fontSize: 13,
    flex: 1,
  },
  storeCount: {
    color: c.muted,
    fontSize: 11,
    background: c.surface,
    border: `1px solid ${c.border}`,
    padding: "5px 9px",
    borderRadius: 8,
  },
  // Store cards
  storesGrid: { display: "flex", flexDirection: "column", gap: 8 },
  storeCard: {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    padding: "12px 14px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  storeCardTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  storeCardLogo: {
    fontSize: 22,
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    flexShrink: 0,
  },
  storeCardInfo: { flex: 1, minWidth: 0 },
  storeCardName: { fontWeight: 600, fontSize: 14, marginBottom: 1 },
  storeCardCat: { color: c.muted, fontSize: 11 },
  storeArrow: { color: c.dim, fontSize: 14, flexShrink: 0 },
  storeCardBottom: {
    display: "flex",
    gap: 10,
    fontSize: 11,
    color: c.muted,
    borderTop: `1px solid ${c.border}`,
    paddingTop: 8,
  },
  storeRating: { color: c.warning },
  storeProdCount: {},
  verified: { color: c.accent, fontSize: 10, fontWeight: 700 },
  // Store hero
  storeHero: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottom: `1px solid ${c.border}`,
  },
  storeHeroLogo: {
    fontSize: 28,
    width: 50,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: c.surface,
    borderRadius: 10,
    border: `1px solid ${c.border}`,
    flexShrink: 0,
  },
  storeHeroName: { fontWeight: 700, fontSize: 16, marginBottom: 3 },
  storeHeroMeta: {
    color: c.muted,
    fontSize: 11,
    display: "flex",
    gap: 4,
    alignItems: "center",
  },
  dot: { margin: "0 2px" },
  // Cart bar (sticky summary in detail view)
  cartBar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: c.accent,
    border: "none",
    borderRadius: 10,
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 14px",
    marginBottom: 14,
    boxSizing: "border-box",
  },
  cartBarPrice: { fontWeight: 700, fontSize: 14 },
  // Products grid
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
  },
  productCard: {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    padding: "10px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  productImgWrap: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  productImg: { width: "100%", height: "100%", objectFit: "cover" },
  outOfStock: {
    position: "absolute",
    top: 6,
    right: 6,
    background: "rgba(248,113,113,0.15)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
    color: c.danger,
    padding: "1px 5px",
  },
  productCategory: {
    fontSize: 9,
    color: c.dim,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 2,
  },
  productName: {
    fontWeight: 600,
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 1.3,
    flex: 1,
  },
  productPriceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  productPrice: { fontWeight: 700, fontSize: 13, color: c.accent },
  inCartBadge: {
    background: "rgba(109,127,255,0.2)",
    color: c.accent,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    padding: "1px 5px",
  },
  addBtn: {
    width: "100%",
    background: c.accent,
    border: "none",
    borderRadius: 7,
    color: "#fff",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    padding: "7px 0",
  },
  addBtnDisabled: {
    background: "rgba(255,255,255,0.06)",
    color: c.dim,
    cursor: "not-allowed",
  },
  // Cart
  cartItems: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 16,
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: c.surface,
    borderRadius: 10,
    padding: 10,
    border: `1px solid ${c.border}`,
  },
  cartItemImg: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 8,
    overflow: "hidden",
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemInfo: { flex: 1, minWidth: 0 },
  cartItemName: {
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cartItemStore: { color: c.muted, fontSize: 10 },
  cartItemPrice: {
    color: c.accent,
    fontWeight: 600,
    fontSize: 12,
    marginTop: 2,
  },
  cartItemControls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  qtyBtn: {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 5,
    color: c.text,
    cursor: "pointer",
    fontSize: 13,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  qtyNum: { fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: "center" },
  removeBtn: {
    background: "none",
    border: "none",
    color: c.danger,
    cursor: "pointer",
    fontSize: 11,
    marginLeft: 2,
    opacity: 0.7,
    padding: 0,
  },
  cartFooter: {
    borderTop: `1px solid ${c.border}`,
    paddingTop: 14,
  },
  cartTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    fontSize: 13,
    color: c.muted,
  },
  totalAmount: { color: c.text, fontWeight: 700, fontSize: 17 },
  checkoutBtn: {
    width: "100%",
    background: c.accent,
    border: "none",
    borderRadius: 10,
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    padding: "11px 0",
  },
  browsBtn: {
    background: c.accent,
    border: "none",
    borderRadius: 9,
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 22px",
  },
  // Misc
  retryBtn: {
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 8,
    color: c.danger,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    padding: "7px 16px",
  },
  spinner: {
    width: 26,
    height: 26,
    border: `3px solid rgba(109,127,255,0.15)`,
    borderTop: `3px solid ${c.accent}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  toast: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(109,127,255,0.96)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 500,
    padding: "10px 18px",
    zIndex: 999,
    whiteSpace: "nowrap",
    boxShadow: "0 4px 15px rgba(109,127,255,0.35)",
  },
};
