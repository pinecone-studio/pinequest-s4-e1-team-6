import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("storeName");

    if (!userId || !storeName) {
      return NextResponse.json(
        { success: false, error: "Authentication or store name missing" }, 
        { status: 400 }
      );
    }
    const describeIndex = await index.describeIndexStats();
    const productCount = describeIndex.namespaces?.[storeName]?.recordCount || 0;

    const orderCount = await prisma.order.count();

    return NextResponse.json({
      success: true,
      productCount,
      orderCount,
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}