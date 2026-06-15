import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/roles";
import { index } from "@/lib/api/pinecone";
import { getStoreNamespaces } from "@/lib/search/get-store-namespaces";
import { getStock } from "@/lib/search/stock";

// Барааны жинхэнэ эх сурвалж нь Pinecone (нэмэх/засах/захиалга бүгд тийш бичдэг).
// Тиймээс админ ч мөн Pinecone-оос уншиж, хайлттай ижил үлдэгдлийг харуулна.
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const namespaces = await getStoreNamespaces();
  const zeroVector = new Array(1536).fill(0);

  const perNamespace = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        const res = await index.namespace(ns).query({
          vector: zeroVector,
          topK: 1000,
          includeMetadata: true,
        });
        return (res.matches || []).map((match) => {
          const meta = (match.metadata || {}) as Record<string, unknown>;
          const stock = getStock(meta) ?? 0;
          return {
            id: match.id,
            namespace: ns,
            name: String(meta.name || meta.product_name || "Нэргүй бараа"),
            price: Number(meta.price || meta.formatted_price || 0),
            stock,
            brand: String(meta.brand || ""),
            image: String(
              meta.product_image_url || meta.image_url || meta.image || "",
            ),
            storeName: String(meta.store_name || meta.storeName || ns),
            status:
              stock > 0
                ? "AVAILABLE"
                : String(meta.status || "OUT_OF_STOCK").toUpperCase(),
          };
        });
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const products = perNamespace
    .flat()
    .filter((p) => {
      const key = `${p.namespace}::${p.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      // Дууссан бараа доош, дараа нь нэрээр
      const aSold = a.stock <= 0;
      const bSold = b.stock <= 0;
      if (aSold !== bSold) return aSold ? 1 : -1;
      return a.name.localeCompare(b.name, "mn");
    });

  return NextResponse.json({ products });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { productId, namespace } = await req.json();
  if (!productId || !namespace)
    return NextResponse.json(
      { error: "productId болон namespace шаардлагатай" },
      { status: 400 },
    );

  await index.namespace(String(namespace)).deleteOne({ id: String(productId) });
  return NextResponse.json({ success: true });
}
