import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      brand: true,
      images: true,
      store: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ products });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { productId } = await req.json();
  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ success: true });
}
