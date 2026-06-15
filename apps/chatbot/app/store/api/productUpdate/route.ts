import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getStock } from "@/lib/search/stock";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

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

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      id,
      name,
      price,
      stock,
      storeName,
      imageUrl,
      category,
      description,
      brand,
      size,
      sizes,
      sizeStock,
      colorSizeStock,
      color,
      colors,
    } = body;

    if (!id || !storeName) {
      return NextResponse.json(
        { error: "ID болон storeName шаардлагатай" },
        { status: 400 },
      );
    }

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

    // Шинэ үлдэгдлээс status-ийг тооцоолж дахин бичнэ.
    // Ингэснээр нөөц нэмэхэд бараа дахин зарагдах боломжтой болж,
    // дууссан бол OUT_OF_STOCK болж хайлтаас нуугдана.
    const totalStock =
      getStock({
        stock,
        colorSizeStock,
        color_size_stock: colorSizeStock,
        sizeStock,
        size_stock: sizeStock,
      }) ?? Number(stock) ?? 0;
    const computedStatus = totalStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";

    await index.namespace(storeName).update({
      id: id,
      values: vector,
      metadata: {
        name: name || "",
        price: Number(price) || 0,
        product_image_url: imageUrl || "",
        description: description || "",
        category: category || "",
        brand: brand || "",
        stock: Number(stock) || 0,
        status: computedStatus,
        store_name: storeName,
        size: size || "",
        sizes: Array.isArray(sizes) ? sizes.map(String) : [],
        sizeStock: sizeStock || "",
        size_stock: sizeStock || "",
        color: color || "",
        colors: Array.isArray(colors) ? colors.map(String) : [],
        colorSizeStock: colorSizeStock || "",
        color_size_stock: colorSizeStock || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pinecone дээр амжилттай шинэчлэгдлээ",
    });
  } catch (error: unknown) {
    console.error("PINECONE_UPDATE_ERROR:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: "Pinecone дээр барааг засахад алдаа гарлаа: " + message,
      },
      { status: 500 },
    );
  }
}
