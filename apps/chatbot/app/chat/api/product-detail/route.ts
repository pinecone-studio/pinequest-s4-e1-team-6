import { NextRequest, NextResponse } from "next/server";
import { index } from "@/lib/api/pinecone";
import { getStoreNamespaces } from "@/lib/search/get-store-namespaces";

// Барааны бүрэн metadata-г (размер, өнгө, үлдэгдэл) Pinecone-оос id-аар нь авна.
// Хайлт/чатын урсгал эдгээр талбарыг алддаг тул detail нээгдэхэд эндээс авна.
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")?.trim();
    const store = req.nextUrl.searchParams.get("store")?.trim();
    if (!id) {
      return NextResponse.json({ error: "id шаардлагатай" }, { status: 400 });
    }

    // Эхлээд мэдэгдэж буй дэлгүүрийн namespace-аас хайна
    const tryNamespaces = store
      ? [store, ...(await getStoreNamespaces()).filter((n) => n !== store)]
      : await getStoreNamespaces();

    for (const ns of tryNamespaces) {
      try {
        const res = await index.namespace(ns).fetch({ ids: [id] });
        const record = res.records?.[id];
        if (record?.metadata) {
          return NextResponse.json({
            found: true,
            namespace: ns,
            metadata: record.metadata,
          });
        }
      } catch {
        // дараагийн namespace руу
      }
    }

    return NextResponse.json({ found: false, metadata: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
