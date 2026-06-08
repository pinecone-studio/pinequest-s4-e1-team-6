import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, name, price, image } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "ProductId is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const safeName = name || "Product";
    const productSlug = `${safeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;

    await prisma.category.upsert({
      where: { id: "ai-suggested-category" },
      update: {},
      create: {
        id: "ai-suggested-category",
        name: "AI_Suggested",
        slug: "ai-suggested",
      },
    });

    const product = await prisma.product.upsert({
      where: { id: productId },
      update: {},
      create: {
        id: productId,
        name: safeName,
        slug: productSlug,
        price: parseFloat(String(price)) || 0,
        images: image ? [image] : [],
        description: `AI-аас санал болгосон: ${safeName}`,
        status: "AVAILABLE",
        brand: "AI",
        subcategory: "AI_Suggested",
        categoryId: "ai-suggested-category",
      },
    });

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ saved: false });
    } else {
      const newFavorite = await prisma.favorite.create({
        data: {
          userId: user.id,
          productId: product.id,
        },
      });
      return NextResponse.json({ saved: true, data: newFavorite });
    }
  } catch (error: unknown) {
    console.error("FAVORITE_API_ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json([], { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) return NextResponse.json([]);

    const favoriteRows = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        productId: true,
      },
    });

    if (favoriteRows.length === 0) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: [...new Set(favoriteRows.map((favorite) => favorite.productId))],
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        description: true,
        storeId: true,
        brand: true,
        slug: true,
      },
    });

    const productById = new Map(products.map((product) => [product.id, product]));
    const favorites = favoriteRows.flatMap((favorite) => {
      const product = productById.get(favorite.productId);
      if (!product) return [];

      return [
        {
          productId: favorite.productId,
          product,
        },
      ];
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("FAVORITES_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Татахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
