/**
 * Pinecone-д хадгалагдсан барааны metadata-аас үлдэгдэл (stock) тооцоолж,
 * худалдан авах боломжтой эсэхийг шийддэг туслах функцууд.
 *
 * Захиалга үүсэх үед stock 0 болоход metadata.status = "OUT_OF_STOCK" болж,
 * stock талбар 0 болдог (app/chat/api/orders/route.ts). Энэ шалгуур нь тэр
 * дууссан барааг хэрэглэгчийн хайлт/жагсаалтаас нуухад хэрэглэгдэнэ.
 */

type Meta = Record<string, unknown> | undefined | null;

const SOLD_OUT_STATUSES = new Set([
  "OUT_OF_STOCK",
  "SOLD_OUT",
  "SOLDOUT",
  "UNAVAILABLE",
  "HIDDEN",
  "DELETED",
]);

function parseVariantStock(value: unknown): number | null {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return null;
    let total = 0;
    let found = false;
    for (const row of parsed) {
      const stock = Number((row as { stock?: unknown })?.stock);
      if (Number.isFinite(stock)) {
        total += Math.max(0, stock);
        found = true;
      }
    }
    return found ? total : null;
  } catch {
    return null;
  }
}

/**
 * Барааны нийт үлдэгдлийг буцаана. Хэмжээ/өнгөний хувилбартай бол бүх
 * хувилбарын нийлбэр. Тодорхойлох боломжгүй (мэдээлэлгүй) бол `null`.
 */
export function getStock(meta: Meta): number | null {
  if (!meta) return null;

  const variantStock =
    parseVariantStock(meta.colorSizeStock) ??
    parseVariantStock(meta.color_size_stock) ??
    parseVariantStock(meta.sizeStock) ??
    parseVariantStock(meta.size_stock);
  if (variantStock !== null) return variantStock;

  const raw = meta.stock;
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Бараа худалдан авах боломжтой (үлдэгдэлтэй) эсэх.
 *
 * Тоон үлдэгдлийг ҮНДСЭН эх сурвалж болгоно: үлдэгдэл мэдэгдэж байвал зөвхөн
 * түүгээр шийднэ (status хуучирсан байж болзошгүй). Жишээ нь: нөөц нэмсэн ч
 * status нь OUT_OF_STOCK хэвээр үлдсэн бараа (stock > 0) нь зарагдах боломжтой.
 *
 * - үлдэгдэл > 0 → true
 * - үлдэгдэл 0 ба түүнээс бага → false
 * - үлдэгдэл огт мэдэгдэхгүй бол л status-аар шийднэ (fallback)
 */
export function isInStock(meta: Meta): boolean {
  if (!meta) return true;

  const stock = getStock(meta);
  if (stock !== null) return stock > 0;

  const status = String(meta.status ?? "")
    .trim()
    .toUpperCase();
  if (SOLD_OUT_STATUSES.has(status)) return false;

  return true;
}
