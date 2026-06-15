"use client";

import { useState } from "react";
import { ArrowLeft, Search, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  storeId: string;
  storeName: string;
  brand: string;
  category: string;
};

function SearchColumn({
  title,
  query,
  onQueryChange,
  onSearch,
  results,
  selected,
  onSelect,
  isLoading,
}: {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  results: Product[];
  selected: Product | null;
  onSelect: (product: Product) => void;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur-xl">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-white/70">
        {title}
      </p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Бараа хайх..."
          className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45"
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <button
          onClick={onSearch}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white transition hover:bg-white/14"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {selected && (
          <div className="rounded-2xl border border-[#9f8cff]/30 bg-[#9f8cff]/10 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d9cfff]">
              Selected
            </p>
            <div className="mt-2 flex gap-3">
              <img
                src={selected.image || "/placeholder.png"}
                alt={selected.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold text-white">
                  {selected.name}
                </p>
                <p className="mt-1 text-sm text-[#d9cfff]">{selected.price}</p>
                <p className="mt-1 text-xs text-white/60">{selected.storeName}</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/60">
              Хайж байна...
            </div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/6 p-3 text-left transition hover:bg-white/10"
              >
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold text-white">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-white/65">{product.storeName}</p>
                  <p className="mt-1 text-sm text-[#d9cfff]">{product.price}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");
  const [leftResults, setLeftResults] = useState<Product[]>([]);
  const [rightResults, setRightResults] = useState<Product[]>([]);
  const [leftSelected, setLeftSelected] = useState<Product | null>(null);
  const [rightSelected, setRightSelected] = useState<Product | null>(null);
  const [loadingSide, setLoadingSide] = useState<"left" | "right" | null>(null);

  const runSearch = async (side: "left" | "right") => {
    const query = side === "left" ? leftQuery.trim() : rightQuery.trim();
    if (!query) return;

    setLoadingSide(side);
    try {
      const res = await fetch(
        `/chat/api/product-search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      const products = data.products || [];
      if (side === "left") setLeftResults(products);
      else setRightResults(products);
    } finally {
      setLoadingSide(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#2f8bf0] text-white dark:bg-[#0B1020]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,#4098f3_0%,#2b7fe3_34%,#1f63d8_68%,#8c88f5_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_34%),linear-gradient(135deg,#111827_0%,#1f2a60_38%,#0f172a_100%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-6">
        <header className="apple-liquid-glass mb-6 flex items-center justify-between rounded-[30px] px-5 py-4">
          <button
            onClick={() => router.push("/")}
            className="apple-liquid-control inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </button>
          <div className="flex items-center gap-2 text-white">
            <Scale className="h-5 w-5" />
            <span className="text-lg font-bold">Product Comparison</span>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <SearchColumn
            title="Search Product A"
            query={leftQuery}
            onQueryChange={setLeftQuery}
            onSearch={() => runSearch("left")}
            results={leftResults}
            selected={leftSelected}
            onSelect={setLeftSelected}
            isLoading={loadingSide === "left"}
          />
          <SearchColumn
            title="Search Product B"
            query={rightQuery}
            onQueryChange={setRightQuery}
            onSearch={() => runSearch("right")}
            results={rightResults}
            selected={rightSelected}
            onSelect={setRightSelected}
            isLoading={loadingSide === "right"}
          />
        </div>

        {leftSelected && rightSelected && (
          <section className="apple-liquid-glass mt-6 rounded-[30px] p-6">
            <h2 className="mb-4 text-xl font-black">Comparison Result</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[leftSelected, rightSelected].map((product) => (
                <article
                  key={product.id}
                  className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-md"
                >
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    className="mb-4 aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                  <p className="text-lg font-bold">{product.name}</p>
                  <p className="mt-1 text-[#d9cfff]">{product.price}</p>
                  <div className="mt-3 space-y-2 text-sm text-white/72">
                    <p><span className="font-semibold text-white">Store:</span> {product.storeName}</p>
                    <p><span className="font-semibold text-white">Brand:</span> {product.brand || "N/A"}</p>
                    <p><span className="font-semibold text-white">Category:</span> {product.category || "N/A"}</p>
                    <p><span className="font-semibold text-white">Description:</span> {product.description || "Тайлбар байхгүй."}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
