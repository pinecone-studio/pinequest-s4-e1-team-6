// import { NextRequest, NextResponse } from "next/server";
// import OpenAI from "openai";
// import { Pinecone } from "@pinecone-database/pinecone";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
// const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("image") as File;

//     if (!file) return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 400 });

//     const bytes = await file.arrayBuffer();
//     const base64Image = Buffer.from(bytes).toString("base64");

//     const vision = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: [
//             { type: "text", text: "Describe this product for search. Item type, color, brand, style." },
//             { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
//           ],
//         },
//       ],
//     });

//     const description: string = vision.choices[0]?.message?.content || "No description provided";

//     const embeddingResponse = await openai.embeddings.create({
//       model: "text-embedding-3-small",
//       input: description,
//     });

//     const vector = embeddingResponse.data[0]?.embedding;
//     if (!vector) {
//       throw new Error("Embedding үүсгэж чадсангүй.");
//     }

//     const indexName = process.env.PINECONE_NAME;
//     if (!indexName) throw new Error("Pinecone index name is missing");

//     const index = pc.index(indexName);
//     const queryResult = await index.query({
//       vector: vector,
//       topK: 6,
//       includeMetadata: true,
//     });

//     const products = queryResult.matches.map(m => {
//       const meta = (m.metadata || {}) as any;
//       return {
//         id: m.id,
//         name: String(meta.product_name || meta.name || "Нэргүй"),
//         price: String(meta.formatted_price || meta.price || "0"),
//         image: String(meta.product_image_url || meta.image_url || meta.image || ""),
//         description: String(meta.description || ""),
//         store_id: String(meta.store_id || meta.storeId || "default")
//       };
//     });

//     return NextResponse.json({ products, description });
//   } catch (error: any) {
//     console.error("Vision Search Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { getStoreNamespaces } from "@/lib/search/get-store-namespaces";
import { isInStock } from "@/lib/search/stock";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

type ProductMetadata = {
  product_name?: string;
  name?: string;
  formatted_price?: string | number;
  price?: string | number;
  product_image_url?: string;
  image_url?: string;
  image?: string;
  description?: string;
  store_id?: string;
  storeId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file)
      return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    const vision = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this product for search. Item type, color, brand, style.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    const description: string =
      vision.choices[0]?.message?.content || "No description provided";

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: description,
    });

    const vector = embeddingResponse.data[0]?.embedding;
    if (!vector) throw new Error("Embedding үүсгэж чадсангүй.");

    const indexName = process.env.PINECONE_NAME;
    if (!indexName) throw new Error("Pinecone index name is missing");

    const index = pc.index(indexName);

    const namespaces = await getStoreNamespaces();

    const queryPromises = namespaces.map((ns) =>
      index.namespace(ns).query({
        vector,
        topK: 6,
        includeMetadata: true,
      }),
    );

    const allResults = await Promise.all(queryPromises);
    const allMatches = allResults
      .flatMap((r) => r.matches || [])
      // Үлдэгдэл дууссан барааг харуулахгүй
      .filter((m) => isInStock(m.metadata as Record<string, unknown>))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 6);

    const products = allMatches.map((m) => {
      const meta = (m.metadata || {}) as ProductMetadata;
      return {
        id: m.id,
        name: String(meta.product_name || meta.name || "Нэргүй"),
        price: String(meta.formatted_price || meta.price || "0"),
        image: String(
          meta.product_image_url || meta.image_url || meta.image || "",
        ),
        description: String(meta.description || ""),
        store_id: String(meta.store_id || meta.storeId || "default"),
      };
    });

    return NextResponse.json({ products, description });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown search error";
    console.error("Vision Search Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
