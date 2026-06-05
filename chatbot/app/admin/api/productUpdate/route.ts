import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

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
    } = body;

    if (!id || !storeName) {
      return NextResponse.json(
        { error: "ID болон storeName шаардлагатай" },
        { status: 400 },
      );
    }

    await index.namespace(storeName).update({
      id: id,
      metadata: {
        name: name || "",
        price: Number(price) || 0,
        product_image_url: imageUrl || "",
        description: description || "",
        category: category || "",
        brand: brand || "",
        stock: Number(stock) || 0,
        store_name: storeName,
        size: size || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pinecone дээр амжилттай шинэчлэгдлээ",
    });
  } catch (error: any) {
    console.error("PINECONE_UPDATE_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Pinecone дээр барааг засахад алдаа гарлаа: " + error.message,
      },
      { status: 500 },
    );
  }
}
