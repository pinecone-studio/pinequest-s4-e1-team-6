
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
        stock: meta.stock || 0,
        size: meta.size || "",
        sizes: meta.sizes || [],
        sizeStock: meta.sizeStock || meta.size_stock || "",
        metadata: meta,
      };
    }) || [];

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("Pinecone GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
