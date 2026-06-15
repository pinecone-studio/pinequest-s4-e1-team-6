import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  DELIVERED_STATUSES,
  productLimitFor,
  ordersToNextTier,
} from "@/lib/store/trust-tier";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NextRequest, NextResponse } from "next/server";

function parseSizeStockText(value: unknown) {
  if (!value) return "";

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return "";

    return parsed
      .map(
        (item) =>
          `${item?.color || ""} өнгө ${item?.size || ""} размер ${
            item?.stock || ""
          } ширхэг`,
      )
      .join(", ");
  } catch {
    return String(value);
  }
}

function buildProductSearchText(product: {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  brand?: unknown;
  color?: unknown;
  size?: unknown;
  sizes?: unknown;
  sizeStock?: unknown;
  colorSizeStock?: unknown;
  price?: unknown;
  stock?: unknown;
}) {
  const sizes = Array.isArray(product.sizes) ? product.sizes.join(", ") : "";

  return [
    `Бүтээгдэхүүн: ${product.name || ""}`,
    `Тайлбар: ${product.description || ""}`,
    `Ангилал: ${product.category || ""}`,
    `Брэнд: ${product.brand || ""}`,
    `Өнгө: ${product.color || ""}`,
    `Размер: ${product.size || ""} ${sizes}`,
    `Өнгө размерын үлдэгдэл: ${parseSizeStockText(
      product.colorSizeStock || product.sizeStock,
    )}`,
    `Үнэ: ${product.price || ""}`,
    `Нийт үлдэгдэл: ${product.stock || ""}`,
  ].join(". ");
}


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      brand,
      stock,
      size,
      sizes,
      sizeStock,
      color,
      colorSizeStock,
      storeName,
    } = body;

    if (!storeName) {
      return NextResponse.json(
        { error: "storeName байхгүй байна." },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    const store = await prisma.store.findFirst({
      where: {
        ownerId: dbUser?.id,
        name: storeName,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Дэлгүүр олдсонгүй" }, { status: 404 });
    }

    // ── Trust-tier хязгаарлалт ──────────────────────────────────────────
    // Амжилттай хүргэгдсэн захиалгын тоогоор байршуулж болох барааны хязгаар
    const deliveredCount = await prisma.order.count({
      where: {
        storeId: store.id,
        status: { in: [...DELIVERED_STATUSES] },
      },
    });
    const limit = productLimitFor(deliveredCount);
    if (limit !== Infinity) {
      let currentProducts = 0;
      try {
        const stats = await index.describeIndexStats();
        currentProducts = stats.namespaces?.[storeName]?.recordCount ?? 0;
      } catch {
        currentProducts = 0;
      }
      if (currentProducts >= limit) {
        const need = ordersToNextTier(deliveredCount);
        return NextResponse.json(
          {
            error: `Та одоогоор хамгийн ихдээ ${limit} бараа байршуулах эрхтэй (${currentProducts}/${limit}). ${
              need
                ? `Дараагийн түвшинд хүрэхийн тулд ${need} захиалгыг амжилттай хүргэнэ үү.`
                : ""
            }`.trim(),
            limit,
            currentProducts,
            deliveredCount,
          },
          { status: 403 },
        );
      }
    }
    // ────────────────────────────────────────────────────────────────────

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });

    const vector = await embeddings.embedQuery(
      buildProductSearchText({
        name,
        description,
        category,
        brand,
        color,
        size,
        sizes,
        sizeStock,
        colorSizeStock,
        price,
        stock,
      }),
    );
    const generatedId = `prod_${Date.now()}`;

    const normalizedName = String(name || "").toLowerCase();
    const normalizedBrand = String(brand || "").toLowerCase();

    await index.namespace(storeName).upsert({
      records: [
        {
          id: generatedId,
          values: vector,
          metadata: {
            name,
            name_search: normalizedName,
            price: Number(price),
            product_image_url: imageUrl,
            description: description || "",
            category: category || "",
            brand: brand || "",
            brand_search: normalizedBrand,
            stock: Number(stock),
            status: Number(stock) > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
            store_name: storeName,
            storeId: store.id,
            size: size || "",
            sizes: Array.isArray(sizes) ? sizes.map(String) : [],
            sizeStock: sizeStock || "",
            size_stock: sizeStock || "",
            color: color || "",
            colors: Array.isArray(body.colors) ? body.colors : [],
            colorSizeStock: colorSizeStock || "",
            color_size_stock: colorSizeStock || "",
          },
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
