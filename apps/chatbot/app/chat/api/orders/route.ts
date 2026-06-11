import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { index } from "@/lib/api/pinecone";

type OrderRequestItem = {
  id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  productImage?: string;
  product_image_url?: string;
  image?: string;
  quantity?: number | string;
  price?: number | string;
  storeId?: string;
  store_id?: string;
  storeName?: string;
  store_name?: string;
};

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, totalAmount, customerPhone, address, storeId, storeName } = body as {
      items?: OrderRequestItem[];
      totalAmount?: number | string;
      customerPhone?: string;
      address?: string;
      storeId?: string;
      storeName?: string;
    };

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
              ].filter(Boolean) as { id: string }[] | { name: string }[],
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
          (sum: number, item) =>
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
          create: items.map((item) => ({
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

    try {
      for (const item of items) {
        const quantity = Number(item.quantity) || 1;
        const productId = String(item.productId || item.id || "");
        const productName = item.name || item.productName || "";

        if (!productId && !productName) continue;

        const namespace = index.namespace(store.name);
        let match = productId
          ? (await namespace.fetch({ ids: [productId] })).records?.[productId]
          : null;

        if (!match && productName) {
          const searchRes = await namespace.query({
            vector: new Array(1536).fill(0.000001),
            topK: 5,
            includeMetadata: true,
            filter: { name: { $eq: productName } },
          });

          match = searchRes.matches?.[0] ?? null;
        }

        if (!match) {
          console.log(`Бараа олдсонгүй: ${productName}`);
          continue;
        }

        const currentStock = Number(match.metadata?.stock) || 0;
        const newStock = Math.max(0, currentStock - quantity);
        const status = newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";

        await namespace.update({
          id: match.id,
          metadata: {
            ...(match.metadata as Record<string, unknown>),
            stock: newStock,
            status,
          },
        });

        await prisma.product.updateMany({
          where: { id: String(item.productId || item.id || ""), storeId: store.id },
          data: { stock: newStock, status },
        });

        console.log(`${productName}: ${currentStock} -> ${newStock}`);
      }
    } catch (stockErr) {
      console.error("Stock update error:", stockErr);
    }

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json({ 
      error: "Захиалга үүсгэхэд алдаа гарлаа", 
      details: String(error) 
    }, { status: 500 });
  }
}
