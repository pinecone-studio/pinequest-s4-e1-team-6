// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET() {
//   try {
//     const { userId: clerkId } = await auth();
//     if (!clerkId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const user = await prisma.user.findUnique({
//       where: { clerkUserId: clerkId },
//       select: { storeName: true },
//     });

//     return NextResponse.json({
//       success: true,
//       storeName: user?.storeName ?? null,
//     });
//   } catch (error) {
//     console.error("GET_STORE_ERROR:", error);
//     return NextResponse.json({ success: false }, { status: 500 });
//   }
// }

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
        ownerId: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // StoresPage-д шаардагдах форматад хөрвүүлнэ
    const formatted = stores.map((s) => ({
      id: s.id,
      name: s.name,
      logo: "🏪",
      category: s.description ?? "",
      rating: 0,
      productCount: s._count.products,
      isVerified: false,
    }));

    return NextResponse.json({ success: true, stores: formatted });
  } catch (error) {
    console.error("GET_STORE_ERROR:", error);
    return NextResponse.json({ success: false, stores: [] }, { status: 500 });
  }
}
