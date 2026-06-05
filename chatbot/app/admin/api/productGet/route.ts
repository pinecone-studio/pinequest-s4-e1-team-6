import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { Pinecone } from "@pinecone-database/pinecone/dist/pinecone";

// export async function GET() {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
//     const index = pc.index(process.env.PINECONE_NAME!);

//     const queryResponse = await index.namespace(userId).query({
//       vector: Array(1536).fill(0),
//       topK: 100,
//       includeMetadata: true,
//     });

//     const products = queryResponse.matches.map((match) => ({
//       id: match.id,
//       metadata: match.metadata,
//     }));

//     return NextResponse.json(
//       { success: true, products },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control": "no-store, max-age=0",
//         },
//       },
//     );
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const { userId } = await auth();
//     if (!userId)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
//     const index = pc.index(process.env.PINECONE_NAME!);

//     // Алдаанаас сэргийлж тэг биш вектор үүсгэх
//     const dummyVector = Array(1536).fill(0);
//     dummyVector[0] = 0.000001;

//     const queryResponse = await index.namespace(userId).query({
//       vector: dummyVector, // Энд dummyVector-оо ашиглана
//       topK: 100,
//       includeMetadata: true,
//     });

//     const products = queryResponse.matches.map((match) => ({
//       id: match.id,
//       ...match.metadata, // Metadata-г задалж өгвөл фронт талд уншихад хялбар
//     }));

//     return NextResponse.json(
//       { success: true, products },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control": "no-store, max-age=0",
//         },
//       },
//     );
//   } catch (error: any) {
//     console.error("GET_PRODUCTS_ERROR:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function GET(req: Request) {
 
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

   
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("storeName");

    if (!storeName) {
      return NextResponse.json(
        { error: "storeName шаардлагатай" },
        { status: 400 },
      );
    }

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(process.env.PINECONE_NAME!);

    const dummyVector = Array(1536).fill(0.000001);

   
    const queryResponse = await index.namespace(storeName).query({
      vector: dummyVector,
      topK: 100,
      includeMetadata: true,
    });

    const products = queryResponse.matches.map((match) => ({
      id: match.id,
      ...(match.metadata as any),
    }));

    return NextResponse.json(
      { success: true, products },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: any) {
    console.error("GET_PRODUCTS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
