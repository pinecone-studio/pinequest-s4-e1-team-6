// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const { userId } = await auth();
//   const { storeName } = await req.json();

//   if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   await prisma.user.update({
//     where: { clerkUserId: userId },
//     data: { storeName: storeName }
//   });

//   return NextResponse.json({ success: true });
// }




import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Дэлгүүрийн нэр заавал хэрэгтэй" }, { status: 400 });
    }

    // 1. Баазаас хэрэглэгчийг олох
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Хэрэглэгч бүртгэлгүй байна" }, { status: 404 });
    }

    // 2. Дэлгүүр үүсгэх
    const newStore = await prisma.store.create({
      data: {
        name: name, // Жишээ нь: "Turuu's store"
        description: description || null,
        ownerId: dbUser.id, // User хүснэгтийн ID-тай холбоно
      },
    });

    return NextResponse.json({ success: true, store: newStore });
  } catch (error: any) {
    console.error("STORE_CREATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
