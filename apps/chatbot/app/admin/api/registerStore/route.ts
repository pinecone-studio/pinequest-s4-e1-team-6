import { index } from "@/lib/api/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    const body = await req.json(); 
    const storeName = body.storeName;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await index.namespace(storeName).upsert({
    records:[
    {
      id: userId,
      values: new Array(1536).fill(0),
      metadata: {
        store_name: storeName,
        admin_id: userId,
      }
    }
  ]});

  return NextResponse.json({ success: true });
}