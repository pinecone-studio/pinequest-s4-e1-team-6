
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { index } from "@/lib/api/pinecone";

type OrderRequestItem = {
  id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  product_image_url?: string;
  imageUrl?: string;
  image?: string;
  quantity?: number | string;
  price?: number | string;
};

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
      include: { stores: true },
    });

    if (!adminUser || adminUser.stores.length === 0) {
      return NextResponse.json([]);
    }

    const storeIds = adminUser.stores.map((s) => s.id);

    const orders = await prisma.order.findMany({
      where: { storeId: { in: storeIds } },
      include: {
        items: true,
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error("GET_ORDERS_ERROR:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, totalAmount, customerPhone, address, storeId, storeName } =
      body as {
        items?: OrderRequestItem[];
        totalAmount?: number | string;
        customerPhone?: string;
        address?: string;
        storeId?: string;
        storeName?: string;
      };

    if (!items || items.length === 0)
      return NextResponse.json(
        { error: "items хоосон байна" },
        { status: 400 },
      );

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
    });
    if (!dbUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ✅ Дэлгүүр хайна
    const store =
      (await prisma.store.findFirst({
        where: {
          OR: [{ id: storeId || "" }, { name: storeName || "" }].filter(
            (w) => Object.values(w)[0] !== "",
          ),
        },
      })) ?? (await prisma.store.findFirst());

    if (!store)
      return NextResponse.json(
        {
          error: `Дэлгүүр олдсонгүй: storeId="${storeId}", storeName="${storeName}"`,
        },
        { status: 400 },
      );

    // ✅ Захиалга үүсгэнэ
    const newOrder = await prisma.order.create({
      data: {
        userId: dbUser.id,
        storeId: store.id,
        productId: String(items[0].productId || items[0].id || "unknown"),
        quantity: Number(items[0].quantity) || 1,
        price: Number(items[0].price) || 0,
        totalAmount: Number(totalAmount) || 0,
        status: "PENDING",
        customerPhone: customerPhone || "99990000",
        address: address || "Default Address",
        items: {
          create: items.map((item) => ({
            productId: String(item.productId || item.id || "unknown"),
            productName: item.name || "Unknown Product",
            productImage:
              item.product_image_url || item.imageUrl || item.image || "",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          })),
        },
      },
      include: { items: true },
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
          console.log(`⚠️ Бараа олдсонгүй: ${productName}`);
          continue;
        }

        const currentStock = Number(match.metadata?.stock) || 0;
        const newStock = Math.max(0, currentStock - quantity);
        const status = newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";

        // stock шинэчилнэ
        await namespace.update({
          id: match.id,
          metadata: {
            ...(match.metadata as Record<string, unknown>),
            stock: newStock,
            status,
          },
        });

        console.log(`✅ ${productName}: ${currentStock} → ${newStock}`);
      }
    } catch (stockErr) {
      console.error("Stock update error:", stockErr);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: unknown) {
    console.error("ORDER_CREATE_ERROR:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Захиалга үүсгэхэд алдаа гарлаа", details },
      { status: 500 },
    );
  }
}
