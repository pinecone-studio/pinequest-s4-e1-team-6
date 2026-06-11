import { index } from "@/lib/api/pinecone";
import { isAdmin } from "@/lib/isAdmin";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    const body = await req.json(); 
    const storeName = body.storeName;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
