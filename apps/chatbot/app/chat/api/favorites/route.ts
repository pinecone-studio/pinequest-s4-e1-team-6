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
    const { productId, name, price, image, storeId } = body;

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
  } catch (error: any) {
    console.error("FAVORITE_API_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json([], { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        favorites: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json([]);

    const favorites = user.favorites.map((f) => ({
      productId: f.productId,
      product: f.product,
    }));

    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json(
      { error: "Татахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
