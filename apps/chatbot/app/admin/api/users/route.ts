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
  await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ success: true });
}
