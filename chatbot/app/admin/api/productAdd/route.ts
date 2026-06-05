import { index } from "@/lib/api/pinecone";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await req.json();
//     const {
//       name,
//       description,
//       price,
//       imageUrl,
//       category,
//       brand,
//       stock,
//       size,
//       storeName,
//     } = body;

//     if (!storeName) {
//       return NextResponse.json(
//         { error: "Дэлгүүрийн нэр (storeName) байхгүй байна." },
//         { status: 400 },
//       );
//     }

//     const embeddings = new OpenAIEmbeddings({
//       openAIApiKey: process.env.OPENAI_KEY,
//       modelName: "text-embedding-3-small",
//     });

//     const vector = await embeddings.embedQuery(
//       `Бүтээгдэхүүн: ${name}. Тайлбар: ${description}`,
//     );
//     const generatedId = `prod_${Date.now()}`;

//     await index.namespace(storeName).upsert({
//       records: [
//         {
//           id: generatedId,
//           values: vector,
//           metadata: {
//             name,
//             price: Number(price),
//             product_image_url: imageUrl,
//             description: description || "",
//             category: category || "",
//             brand: brand || "",
//             stock: Number(stock),
//             store_name: storeName,
//             size: size || 0,
//           },
//         },
//       ],
//     });

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, price, imageUrl, category, brand, stock, size, storeName } = body;

    if (!storeName) {
      return NextResponse.json({ error: "storeName байхгүй байна." }, { status: 400 });
    }

    // ✅ Prisma-аас дэлгүүрийн ID-г авна
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    const store = await prisma.store.findFirst({
      where: {
        ownerId: dbUser?.id,
        name: storeName,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Дэлгүүр олдсонгүй" }, { status: 404 });
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: "text-embedding-3-small",
    });

    const vector = await embeddings.embedQuery(
      `Бүтээгдэхүүн: ${name}. Тайлбар: ${description}`,
    );
    const generatedId = `prod_${Date.now()}`;

    await index.namespace(storeName).upsert({
      records: [
        {
          id: generatedId,
          values: vector,
          metadata: {
            name,
            price: Number(price),
            product_image_url: imageUrl,
            description: description || "",
            category: category || "",
            brand: brand || "",
            stock: Number(stock),
            store_name: storeName,
            storeId: store.id,      // ✅ Заавал нэмэх
            size: size || 0,
          },
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}