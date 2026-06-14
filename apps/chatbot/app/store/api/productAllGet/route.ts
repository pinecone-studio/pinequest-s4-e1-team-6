
import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("storeName");

    if (!userId || !storeName) {
      return NextResponse.json({ success: false, products: [] });
    }

    const queryResponse = await index.namespace(storeName).query({
      vector: new Array(1536).fill(0), 
      topK: 100,
      includeMetadata: true,
    });

    const products = queryResponse.matches?.map(match => {
      const meta = match.metadata || {};
      return {
        id: match.id,
        name: meta.name || "Нэргүй бараа",
        price: meta.price || 0,
        image: meta.product_image_url || meta.imageUrl || "/placeholder.png", 
        category: meta.category || "Бусад",
        brand: meta.brand || "",
        color: meta.color || "",
        colors: meta.colors || [],
        stock: meta.stock || 0,
        size: meta.size || "",
        sizes: meta.sizes || [],
        sizeStock: meta.sizeStock || meta.size_stock || "",
        metadata: meta,
      };
    }) || [];

    products.sort((a, b) => {
      const aSoldOut = Number(a.stock) <= 0;
      const bSoldOut = Number(b.stock) <= 0;

      if (aSoldOut !== bSoldOut) return aSoldOut ? 1 : -1;
      return String(a.name).localeCompare(String(b.name), "mn");
    });

    return NextResponse.json({ success: true, products });
  } catch (error: unknown) {
    console.error("Pinecone GET Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
