import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stores = await prisma.store.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true, // 🏪 Зургийн линкийг баазаас татна
        ownerId: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

const formatted = stores.map((s) => ({
  id: s.id,
  name: s.name,
  logo: "🏪",
  category: s.description ?? "",
  productCount: s._count.products,
}));

    return NextResponse.json({ success: true, stores: formatted });
  } catch (error) {
    console.error("GET_STORE_ERROR:", error);
    return NextResponse.json({ success: false, stores: [] }, { status: 500 });
  }
}