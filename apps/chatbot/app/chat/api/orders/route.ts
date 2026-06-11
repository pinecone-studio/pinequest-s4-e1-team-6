import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, totalAmount, customerPhone, address, storeId, storeName } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "items хоосон байна" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkUserId: clerkId } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const firstItem = items[0] ?? {};
    const productId = String(firstItem.productId || firstItem.id || "");
    const incomingStoreId = storeId || firstItem.storeId || firstItem.store_id;
    const incomingStoreName = storeName || firstItem.storeName || firstItem.store_name;

    let store =
      incomingStoreId || incomingStoreName
        ? await prisma.store.findFirst({
            where: {
              OR: [
                incomingStoreId ? { id: String(incomingStoreId) } : undefined,
                incomingStoreName ? { name: String(incomingStoreName) } : undefined,
              ].filter(Boolean) as any,
            },
          })
        : null;

    if (!store && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { storeId: true, store: true },
      });
      store = product?.store ?? null;
    }

    if (!store) {
      return NextResponse.json(
        { error: "Дэлгүүр олдсонгүй. Захиалгын бараанд storeId/storeName дамжуулах шаардлагатай." },
        { status: 400 },
      );
    }

    const parsedTotal = Number(totalAmount);
    const total = Number.isFinite(parsedTotal)
      ? parsedTotal
      : items.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0,
        );

    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        storeId: store.id,
        productId: productId || "unknown",
        productName: firstItem.name || firstItem.productName || null,
        productImage:
          firstItem.image || firstItem.productImage || firstItem.product_image_url || null,
        totalAmount: total,
        price: Number(firstItem.price) || total,
        quantity: Number(firstItem.quantity) || 1,
        customerPhone: customerPhone || "99990000",
        address: address || "Default Address",
        status: "PAID",
        paidAt: new Date(),
        items: {
          create: items.map((item: any) => ({
            productId: String(item.productId || item.id || "unknown"),
            productName: item.name || item.productName || "Нэр олдоогүй",
            productImage:
              item.image || item.productImage || item.product_image_url || "",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          })),
        },
      },
      include: { items: true, store: { select: { name: true } } },
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json({ 
      error: "Захиалга үүсгэхэд алдаа гарлаа", 
      details: String(error) 
    }, { status: 500 });
  }
}
