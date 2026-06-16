import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Аюулгүй байдлын үүднээс query-г илүү баталгаатай болгов
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        // Хэрэв schema дээр logoUrl байхгүй бол доорх мөрийг түр хасаад шалгаарай
        // logoUrl: true, 
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
      productCount: s._count?.products ?? 0, // Хэрэв products байхгүй бол 0
    }));

    return NextResponse.json({ success: true, stores: formatted });
  } catch (error) {
    // ⚠️ ЭНД ТАНЫ ТЕРМИНАЛ ДЭЭР ЯГ ЯМАР АЛДАА БАЙГААГ ХАРУУЛНА!
    console.error("🚨 GET_STORE_DATABASE_ERROR:", error); 
    
    // Фронт тал унахгүй байх үүднээс 500 биш 200-аар хоосон массив буцааж болно
    return NextResponse.json({ success: false, stores: [] });
  }
}