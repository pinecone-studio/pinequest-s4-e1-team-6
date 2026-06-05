// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// export async function GET() {
//   try {
//     const orders = await prisma.order.findMany({
//       include: {
//         user: true,
//         items: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//     return NextResponse.json(orders);
//   } catch (error) {
//     console.error("GET Orders Error:", error);
//     return NextResponse.json({ error: "Захиалга татахад алдаа гарлаа" }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { orderId, total, items, customerName, customerPhone } = body;

//     const { userId: clerkId } = await auth();
//     if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const dbUser = await prisma.user.findUnique({
//       where: { clerkUserId: clerkId },
//     });
//     if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Сагс хоосон байна" }, { status: 400 });
//     }

//     const newOrder = await prisma.order.create({
//       data: {
//         id: orderId,
//         userId: dbUser.id,
//         productId: items[0].productId || items[0].id || "unknown",
//         quantity: items[0].quantity || 1,
//         price: Number(items[0].price) || 0,
//         totalAmount: Number(total),
//         status: "PAID",
//         customerName: customerName ?? dbUser.name ?? "Guest",
//         customerPhone: customerPhone ?? "88888888",
//         address: "Online Order",
//         items: {
//         create: items.map((item: any) => ({
//             productId: item.productId || item.id || "unknown",
//             productName: item.name || item.product_name || item.productName || "Нэр олдоогүй",
//             productImage: item.image || item.product_image_url || item.imageUrl || item.productImage || "/placeholder.png",
//             quantity: Number(item.quantity) || 1,
//             price: Number(item.price) || 0,
//         })),
//         },
//       },
//     });

//     return NextResponse.json({ success: true, order: newOrder });

//   } catch (error: any) {
//     console.error("CRITICAL PRISMA ERROR:", error);
//     return NextResponse.json(
//       { success: false, error: error.message || "Алдаа гарлаа" },
//       { status: 500 }
//     );
//   }
// }

// // import { NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";
// // import { auth } from "@clerk/nextjs/server";

// // export async function GET() {
// //   try {
// //     const orders = await prisma.order.findMany({
// //       include: {
// //         user: true,
// //         items: true,
// //       },
// //       orderBy: { createdAt: "desc" },
// //     });
// //     return NextResponse.json(orders);
// //   } catch (error) {
// //     console.error("GET Orders Error:", error);
// //     return NextResponse.json({ error: "Захиалга татахад алдаа гарлаа" }, { status: 500 });
// //   }
// // }

// // export async function POST(req: Request) {
// //   try {
// //     const body = await req.json();
// //     const { orderId, total, items, customerName, customerPhone } = body;

// //     const { userId: clerkId } = await auth();
// //     if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// //     const dbUser = await prisma.user.findUnique({
// //       where: { clerkUserId: clerkId },
// //     });
// //     if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

// //     if (!items || items.length === 0) {
// //       return NextResponse.json({ error: "Сагс хоосон байна" }, { status: 400 });
// //     }

// //     const newOrder = await prisma.order.create({
// //       data: {
// //         id: orderId,
// //         userId: dbUser.id,
// //         productId: items[0].productId || items[0].id || "unknown",
// //         quantity: items[0].quantity || 1,
// //         price: Number(items[0].price) || 0,
// //         totalAmount: Number(total),
// //         status: "PAID",
// //         customerName: customerName ?? dbUser.name ?? "Guest",
// //         customerPhone: customerPhone ?? "88888888",
// //         address: "Online Order",
// //         items: {
// //         create: items.map((item: any) => ({
// //             productId: item.productId || item.id || "unknown",
// //             productName: item.name || item.product_name || item.productName || "Нэр олдоогүй",
// //             productImage: item.image || item.product_image_url || item.imageUrl || item.productImage || "/placeholder.png",
// //             quantity: Number(item.quantity) || 1,
// //             price: Number(item.price) || 0,
// //         })),
// //         },
// //       },
// //     });

// //     return NextResponse.json({ success: true, order: newOrder });

// //   } catch (error: any) {
// //     console.error("CRITICAL PRISMA ERROR:", error);
// //     return NextResponse.json(
// //       { success: false, error: error.message || "Алдаа гарлаа" },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET() {
//   try {
//     const { userId: clerkId } = await auth();
//     if (!clerkId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const adminUser = await prisma.user.findUnique({
//       where: { clerkUserId: clerkId },
//       include: { stores: true },
//     });

//     // DEBUG: Консол дээр юу ирж байгааг харах
//     console.log("Admin User Data:", adminUser);

//     if (!adminUser || !adminUser.stores || adminUser.stores.length === 0) {
//       return NextResponse.json([]);
//     }

//     // Одоогоор эхний дэлгүүрийн захиалгуудыг харуулна
//     const storeId = adminUser.stores[0].id;

//     const orders = await prisma.order.findMany({
//       where: { storeId: storeId },
//       include: {
//         items: true, // Захиалгын доторх бараанууд
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(orders);
//   } catch (error: any) {
//     console.error("GET_ORDERS_INTERNAL_ERROR:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       orderId,
//       total,
//       items,
//       customerPhone,
//       address,
//       storeId: incomingStoreId,
//     } = body;

//     const { userId: clerkId } = await auth();
//     if (!clerkId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const dbUser = await prisma.user.findUnique({
//       where: { clerkUserId: clerkId },
//     });

//     if (!dbUser) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // 1. Store ID-г маш нарийн шалгаж олох
//     let validStoreId: string | null = null;

//     // Хэрэв чатботоос storeId эсвэл нэр ирсэн бол
//     if (incomingStoreId && incomingStoreId.trim() !== "") {
//       const foundStore = await prisma.store.findFirst({
//         where: {
//           OR: [{ id: incomingStoreId }, { name: incomingStoreId }],
//         },
//       });
//       // Хэрэв олдсон дэлгүүрийн ID нь хоосон биш бол утгыг авна
//       if (foundStore && foundStore.id !== "") {
//         validStoreId = foundStore.id;
//       }
//     }

//     // Хэрэв олдохгүй бол хэрэглэгчийн өөрийнх нь дэлгүүрийг хайна
//     if (!validStoreId) {
//       const userStore = await prisma.store.findFirst({
//         where: {
//           ownerId: dbUser.id,
//           id: { not: "" }, // ID нь хоосон биш дэлгүүрийг заавал хайна
//         },
//       });
//       validStoreId = userStore?.id || null;
//     }

//     // ЭЦСИЙН ШАЛГАЛТ: ID байхгүй эсвэл хоосон бол алдаа буцаана
//     if (!validStoreId || validStoreId === "") {
//       return NextResponse.json(
//         { error: "Дэлгүүр олдсонгүй. Prisma Studio-д Store ID-г шалгана уу." },
//         { status: 400 },
//       );
//     }

//     // 2. Захиалга үүсгэх
//     const newOrder = await prisma.order.create({
//       data: {
//         id: orderId ?? undefined,
//         userId: dbUser.id,
//         storeId: validStoreId, // Одоо энд хоосон утга орох боломжгүй
//         productId: String(items[0]?.productId || items[0]?.id || "unknown"),
//         quantity: Number(items[0]?.quantity) || 1,
//         price: Number(items[0]?.price) || 0,
//         totalAmount: Number(total),
//         status: "PAID",
//         customerPhone: customerPhone ?? "Not provided",
//         address: address ?? "No address",
//         items: {
//           create: items.map((item: any) => ({
//             productId: String(item.productId || item.id || "unknown"),
//             productName: item.name || "Unknown Product",
//             productImage: item.image || item.product_image_url || "",
//             quantity: Number(item.quantity) || 1,
//             price: Number(item.price) || 0,
//           })),
//         },
//       },
//     });

//     return NextResponse.json({ success: true, order: newOrder });
//   } catch (error: any) {
//     console.error("ORDER_POST_ERROR:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";

// export async function GET() {
//   try {
//     const orders = await prisma.order.findMany({
//       include: {
//         user: true,
//         items: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//     return NextResponse.json(orders);
//   } catch (error) {
//     console.error("GET Orders Error:", error);
//     return NextResponse.json({ error: "Захиалга татахад алдаа гарлаа" }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { orderId, total, items, customerName, customerPhone } = body;

//     const { userId: clerkId } = await auth();
//     if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const dbUser = await prisma.user.findUnique({
//       where: { clerkUserId: clerkId },
//     });
//     if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Сагс хоосон байна" }, { status: 400 });
//     }

//     const newOrder = await prisma.order.create({
//       data: {
//         id: orderId,
//         userId: dbUser.id,
//         productId: items[0].productId || items[0].id || "unknown",
//         quantity: items[0].quantity || 1,
//         price: Number(items[0].price) || 0,
//         totalAmount: Number(total),
//         status: "PAID",
//         customerName: customerName ?? dbUser.name ?? "Guest",
//         customerPhone: customerPhone ?? "88888888",
//         address: "Online Order",
//         items: {
//         create: items.map((item: any) => ({
//             productId: item.productId || item.id || "unknown",
//             productName: item.name || item.product_name || item.productName || "Нэр олдоогүй",
//             productImage: item.image || item.product_image_url || item.imageUrl || item.productImage || "/placeholder.png",
//             quantity: Number(item.quantity) || 1,
//             price: Number(item.price) || 0,
//         })),
//         },
//       },
//     });

//     return NextResponse.json({ success: true, order: newOrder });

//   } catch (error: any) {
//     console.error("CRITICAL PRISMA ERROR:", error);
//     return NextResponse.json(
//       { success: false, error: error.message || "Алдаа гарлаа" },
//       { status: 500 }
//     );
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
        items: true, // productName, productImage энд байна
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET_ORDERS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { items, totalAmount, customerPhone, address, storeId, storeName } =
      body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "items хоосон байна" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkId },
    });
    if (!dbUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // storeId эсвэл storeName-аар хайна (Pinecone metadata-аас)
    if (!storeId && !storeName) {
      return NextResponse.json(
        { error: "storeId эсвэл storeName заавал шаардлагатай" },
        { status: 400 },
      );
    }

    // admin/api/orders/route.ts — POST дотор
    const store =
      (await prisma.store.findFirst({
        where: {
          OR: [{ id: storeId || "" }, { name: storeName || "" }].filter(
            (w) => Object.values(w)[0] !== "",
          ),
        },
      })) ?? (await prisma.store.findFirst()); // ✅ Хэрэв олдохгүй бол анхны дэлгүүрийг авна
    if (!store) {
      return NextResponse.json(
        {
          error: `Дэлгүүр олдсонгүй: storeId="${storeId}", storeName="${storeName}"`,
        },
        { status: 400 },
      );
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: dbUser.id,
        storeId: store.id,
        productId: String(items[0].productId || items[0].id || "unknown"),
        quantity: Number(items[0].quantity) || 1,
        price: Number(items[0].price) || 0,
        totalAmount: parseFloat(totalAmount),
        status: "PENDING",
        customerPhone: customerPhone || "99990000",
        address: address || "Default Address",
        items: {
          create: items.map((item: any) => ({
            productId: String(item.productId || item.id || "unknown"),
            productName: item.name || "Unknown Product",
            // Pinecone-оос ирэх боломжтой бүх field нэрийг дэмжинэ
            productImage:
              item.product_image_url || item.imageUrl || item.image || "",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("ORDER_CREATE_ERROR:", error);
    return NextResponse.json(
      { error: "Захиалга үүсгэхэд алдаа гарлаа", details: String(error) },
      { status: 500 },
    );
  }
}
