import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      storeName: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId, role } = await req.json();
  if (!["USER", "STORE_OWNER", "ADMIN"].includes(role))
    return NextResponse.json({ error: "Buruu role" }, { status: 400 });

  const data: {
    role: "USER" | "STORE_OWNER" | "ADMIN";
    storeName?: string | null;
  } = { role };

  if (role === "USER") {
    // Эрх хураах — идэвхтэй дэлгүүрийг нь татгалзсан болгож, дахин хүсэлт
    // гаргах боломжтой болгоно
    await prisma.store.updateMany({
      where: { ownerId: userId, status: { in: ["PENDING", "APPROVED"] } },
      data: { status: "REJECTED" },
    });
    data.storeName = null;
  } else if (role === "STORE_OWNER") {
    // Батлагдсан дэлгүүртэй бол storeName-г нь сэргээнэ
    const store = await prisma.store.findFirst({
      where: { ownerId: userId, status: "APPROVED" },
      orderBy: { createdAt: "asc" },
      select: { name: true },
    });
    if (store) data.storeName = store.name;
  }

  await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ success: true });
}
