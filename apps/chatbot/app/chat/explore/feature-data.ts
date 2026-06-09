import OpenAI from "openai";
import { index } from "@/lib/api/pinecone";
import {
  FEATURE_PRESETS_BY_SLUG,
  type FeatureProduct,
  type FeatureSlug,
} from "./feature-presets";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  timeout: 30000,
});

const FEATURE_NAMESPACES = [
  "Turuu's store",
  "sadadasda",
  "sephora",
  "ETRNTY",
  "Tugss store",
];

const FEATURE_QUERY_OVERRIDES: Record<FeatureSlug, string> = {
  teleport:
    "trending fast selling popular new arrivals fashion beauty tech products",
  "black-hole":
    "surprise unique rare unexpected product exclusive uncommon limited edition",
  constellation:
    "coordinated matching style outfit accessories aesthetic set premium look",
  "deep-space":
    "rare premium low stock niche hidden gem collectible limited edition product",
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    return Number.isNaN(numeric) ? 0 : numeric;
  }
  return 0;
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function getFeatureProducts(slug: FeatureSlug) {
  const preset = FEATURE_PRESETS_BY_SLUG[slug];
  if (!preset) return [];

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: FEATURE_QUERY_OVERRIDES[slug] || preset.prompt,
  });

  const queryVector = embedding.data[0]?.embedding;
  if (!queryVector) return [];

  const queryResults = await Promise.all(
    FEATURE_NAMESPACES.map((namespace) =>
      index.namespace(namespace).query({
        vector: queryVector,
        topK: 30,
        includeMetadata: true,
      }),
    ),
  );

  const matches = queryResults
    .flatMap((result) => result.matches || [])
    .map((match) => {
      const meta = (match.metadata || {}) as Record<string, unknown>;
      return {
        id: match.id,
        name: String(meta.name || meta.product_name || "Нэргүй бараа"),
        price: String(meta.price || meta.formatted_price || "0"),
        image: String(
          meta.product_image_url || meta.image_url || meta.image || "",
        ),
        description: String(meta.description || "Тайлбар байхгүй"),
        storeId: String(meta.store_id || meta.storeId || "default"),
        storeName: String(
          meta.store_name || meta.storeName || "Манай дэлгүүр",
        ),
        category: String(meta.category || "Ерөнхий"),
        brand: String(meta.brand || "Unknown"),
        stock: toNumber(meta.stock),
        score: Number(match.score || 0),
      } satisfies FeatureProduct;
    });

  const uniqueMatches = dedupeByKey(matches, (item) => item.id || item.name);

  switch (preset.strategy) {
    case "random":
      return shuffle(uniqueMatches).slice(0, 6);
    case "diverse": {
      const diverse = dedupeByKey(
        uniqueMatches.sort((a, b) => b.score - a.score),
        (item) => item.category || item.brand || item.id,
      );
      return diverse.slice(0, 6);
    }
    case "rare": {
      const rareSorted = [...uniqueMatches].sort((a, b) => {
        const aStock = a.stock > 0 ? a.stock : 9999;
        const bStock = b.stock > 0 ? b.stock : 9999;
        if (aStock !== bStock) return aStock - bStock;
        return b.score - a.score;
      });
      return rareSorted.slice(0, 6);
    }
    case "top":
    default:
      return uniqueMatches.sort((a, b) => b.score - a.score).slice(0, 5);
  }
}
