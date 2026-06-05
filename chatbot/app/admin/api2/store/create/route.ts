import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const store = await prisma.store.create({
      data: { 
        name: "Test Store", 
        ownerId: "user123" 
      },
    });
    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json({ error: "Дэлгүүр үүсгэхэд алдаа гарлаа" }, { status: 500 });
  }
}