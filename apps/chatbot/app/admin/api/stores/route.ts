import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const stores = await prisma.store.findMany({
    include: { owner: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ stores });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { storeId, action } = await req.json(); // action: "approve" | "reject" | "delete"
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store)
    return NextResponse.json({ error: "Store oldsongui" }, { status: 404 });

  if (action === "approve") {
    const owner = await prisma.user.findUnique({
      where: { id: store.ownerId },
    });
    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: store.ownerId },
        data: {
          role: owner?.role === "ADMIN" ? "ADMIN" : "STORE_OWNER",
          storeName: store.name,
        },
      }),
    ]);
  } else if (action === "reject") {
    const owner = await prisma.user.findUnique({
      where: { id: store.ownerId },
      select: { role: true },
    });
    const approvedStore = await prisma.store.findFirst({
      where: {
        ownerId: store.ownerId,
        status: "APPROVED",
        id: { not: storeId },
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.store.update({
      where: { id: storeId },
      data: { status: "REJECTED" },
    });

    await prisma.user.update({
      where: { id: store.ownerId },
      data: {
        role:
          owner?.role === "ADMIN"
            ? "ADMIN"
            : approvedStore
              ? "STORE_OWNER"
              : "USER",
        storeName: approvedStore?.name ?? null,
      },
    });
  } else if (action === "delete") {
    if (store.status !== "REJECTED") {
      return NextResponse.json(
        { error: "Зөвхөн татгалзсан дэлгүүрийг устгах боломжтой" },
        { status: 400 },
      );
    }

    const owner = await prisma.user.findUnique({
      where: { id: store.ownerId },
      select: { role: true },
    });
    const approvedStore = await prisma.store.findFirst({
      where: {
        ownerId: store.ownerId,
        status: "APPROVED",
        id: { not: storeId },
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.$transaction([
      prisma.store.delete({ where: { id: storeId } }),
      prisma.user.update({
        where: { id: store.ownerId },
        data: {
          role:
            owner?.role === "ADMIN"
              ? "ADMIN"
              : approvedStore
                ? "STORE_OWNER"
                : "USER",
          storeName: approvedStore?.name ?? null,
        },
      }),
    ]);
  } else {
    return NextResponse.json({ error: "Buruu action" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
