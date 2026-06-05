import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId шаардлагатай" },
        { status: 400 },
      );
    }

    const products = await prisma.product.findMany({
      where: { storeId: storeId },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
