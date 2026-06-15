import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { getStoreNamespaces } from "@/lib/search/get-store-namespaces";


const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

type ProductMetadata = {
  product_name?: string;
  name?: string;
  formatted_price?: string | number;
  price?: string | number;
  product_image_url?: string;
  image_url?: string;
  image?: string;
  description?: string;
  store_id?: string;
  storeId?: string;
  store_name?: string;
  storeName?: string;
  brand?: string;
  category?: string;
  stock?: string | number;
  status?: string;
};

type PineconeMatch = {
  id: string;
  score?: number;
  metadata?: ProductMetadata;
};

function isInStock(metadata?: ProductMetadata) {
  const stock = Number(metadata?.stock ?? 0);
  const status = String(metadata?.status || "").toUpperCase();

  return stock > 0 && status !== "OUT_OF_STOCK";
}

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")?.trim();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const vector = embeddingResponse.data[0]?.embedding;
    if (!vector) throw new Error("Embedding үүсгэж чадсангүй.");

    const indexName = process.env.PINECONE_NAME;
    if (!indexName) throw new Error("Pinecone index name is missing");

    const index = pc.index(indexName);
    const namespaces = await getStoreNamespaces();

    const queryPromises = namespaces.map((ns) =>
      index.namespace(ns).query({
        vector,
        topK: 8,
        includeMetadata: true,
      }),
    );

    const allResults = await Promise.all(queryPromises);
    const deduped = new Map<string, PineconeMatch>();

    allResults
      .flatMap((result) => result.matches || [])
      .filter((match) => {
        const metadata = match.metadata as ProductMetadata;
        return isInStock(metadata);
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .forEach((match) => {
        if (!deduped.has(match.id)) deduped.set(match.id, match);
      });

    const products = Array.from(deduped.values())
      .filter((match) => isInStock(match.metadata as Record<string, unknown>))
      .slice(0, 12)
      .map((match) => {
        const meta = (match.metadata || {}) as ProductMetadata;
        return {
          id: match.id,
          name: String(meta.product_name || meta.name || "Нэргүй"),
          price: String(meta.formatted_price || meta.price || "0"),
          image: String(
            meta.product_image_url || meta.image_url || meta.image || "",
          ),
          description: String(meta.description || ""),
          storeId: String(meta.store_id || meta.storeId || "default"),
          storeName: String(meta.store_name || meta.storeName || "Store"),
          brand: String(meta.brand || ""),
          category: String(meta.category || ""),
        };
      });

    return NextResponse.json({ products });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown search error";
    console.error("Product Search Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
