"use client";

import { useState } from "react";
import { ArrowLeft, Search, Scale, Sparkles, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

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

type ComparisonInsight = {
  summary: string;
  recommendation: string;
  highlights: Array<{
    label: string;
    winner: "left" | "right" | "tie";
    reason: string;
  }>;
};

const parsePriceValue = (price: string) => {
  const numeric = Number(String(price).replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const buildComparisonInsight = (
  left: Product,
  right: Product,
): ComparisonInsight => {
  const leftPrice = parsePriceValue(left.price);
  const rightPrice = parsePriceValue(right.price);
  const cheaperSide =
    leftPrice === rightPrice ? "tie" : leftPrice < rightPrice ? "left" : "right";
  const longerDescSide =
    left.description.length === right.description.length
      ? "tie"
      : left.description.length > right.description.length
        ? "left"
        : "right";
  const sameCategory =
    left.category &&
    right.category &&
    left.category.toLowerCase() === right.category.toLowerCase();
  const sameBrand =
    left.brand && right.brand && left.brand.toLowerCase() === right.brand.toLowerCase();

  const priceDiff = Math.abs(leftPrice - rightPrice);
  const highlights: ComparisonInsight["highlights"] = [
    {
      label: "Үнэ",
      winner: cheaperSide,
      reason:
        cheaperSide === "tie"
          ? "Хоёр барааны үнэ ойролцоо байна."
          : `${cheaperSide === "left" ? left.name : right.name} нь ${priceDiff.toLocaleString()}₮-өөр давуу байна.`,
    },
    {
      label: "Тайлбар",
      winner: longerDescSide,
      reason:
        longerDescSide === "tie"
          ? "Тайлбарын мэдээллийн хэмжээ ойролцоо байна."
          : `${longerDescSide === "left" ? left.name : right.name} нь илүү дэлгэрэнгүй мэдээлэлтэй байна.`,
    },
    {
      label: "Төрөл",
      winner: sameCategory ? "tie" : "left",
      reason: sameCategory
        ? `Хоёулаа ${left.category || "ижил төрлийн"} бараа байна.`
        : `${left.name} нь ${left.category || "өөр"} төрөлд, ${right.name} нь ${right.category || "өөр"} төрөлд хамаарч байна.`,
    },
  ];

  const recommendation =
    cheaperSide === "tie"
      ? `Хоёр бүтээгдэхүүн ойролцоо түвшинд байна. Тайлбар, бренд, дэлгүүрийн мэдрэмжээрээ өөрт илүү таалагдсанаа сонгоход тохиромжтой.`
      : `${cheaperSide === "left" ? left.name : right.name} нь үнэ талдаа илүү ашигтай харагдаж байна. Харин ${cheaperSide === "left" ? right.name : left.name} нь дизайн эсвэл мэдээллийн талаасаа илүү таалагдвал түүнийг сонгож болно.`;

  const summary = sameBrand
    ? `${left.brand} брендийн хоёр сонголт дундаас ${cheaperSide === "tie" ? "үнэ ойролцоо" : "үнэ болон мэдээллийн ялгаа"} ажиглагдаж байна.`
    : `${left.name} ба ${right.name} хоёрын гол ялгаа нь ${cheaperSide === "tie" ? "бренд ба тайлбарын хэв маягт" : "үнэ, бренд болон танилцуулгын түвшинд"} байна.`;

  return { summary, recommendation, highlights };
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
  const { addToCart } = useCart();
  const [leftQuery, setLeftQuery] = useState("");
  const [rightQuery, setRightQuery] = useState("");
  const [leftResults, setLeftResults] = useState<Product[]>([]);
  const [rightResults, setRightResults] = useState<Product[]>([]);
  const [leftSelected, setLeftSelected] = useState<Product | null>(null);
  const [rightSelected, setRightSelected] = useState<Product | null>(null);
  const [loadingSide, setLoadingSide] = useState<"left" | "right" | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

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

  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id);
    try {
      await addToCart({
        ...product,
        storeId: product.storeId,
        price: parsePriceValue(product.price),
        image: product.image || "/placeholder.png",
      });
    } finally {
      setAddingId(null);
    }
  };

  const insight =
    leftSelected && rightSelected
      ? buildComparisonInsight(leftSelected, rightSelected)
      : null;

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
            <span className="text-lg font-bold">Бүтээгдэхүүн харьцуулалт</span>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <SearchColumn
            title="Харьцуулах эхний бүтээгдэхүүн"
            query={leftQuery}
            onQueryChange={setLeftQuery}
            onSearch={() => runSearch("left")}
            results={leftResults}
            selected={leftSelected}
            onSelect={setLeftSelected}
            isLoading={loadingSide === "left"}
          />
          <SearchColumn
            title="Харьцуулах хоёр дахь бүтээгдэхүүн"
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
            <div className="mb-5 rounded-[24px] border border-white/12 bg-white/8 p-4 md:p-5">
              <div className="mb-3 flex items-center gap-2 text-[#efe8ff]">
                <Sparkles className="h-4 w-4" />
                <h2 className="text-base font-black md:text-xl">AI Comparison Summary</h2>
              </div>
              <p className="text-sm leading-6 text-white/82 md:text-[15px]">
                {insight?.summary}
              </p>
              <p className="mt-3 rounded-2xl border border-[#9f8cff]/25 bg-[#9f8cff]/10 px-4 py-3 text-sm leading-6 text-[#f4eeff]">
                {insight?.recommendation}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {insight?.highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-black/10 p-3"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {item.winner === "tie"
                        ? "Tie"
                        : item.winner === "left"
                          ? leftSelected.name
                          : rightSelected.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/68">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

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
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9f8cff] to-[#6f7bff] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {addingId === product.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    <span>{addingId === product.id ? "Adding..." : "Add to cart"}</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
