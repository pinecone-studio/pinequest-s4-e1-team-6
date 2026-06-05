import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    const orders = await prisma.order.findMany({
      where: storeId ? { 
        items: {
          some: {
            productId: { contains: "" } 
          }
        }
      } : {},
      include: {
        items: true,
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ GET Orders API Error:", error);
    return NextResponse.json(
      { error: "Захиалга авахад алдаа гарлаа" }, 
      { status: 500 }
    );
  }
}