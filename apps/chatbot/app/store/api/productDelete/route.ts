import { Pinecone } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index(process.env.PINECONE_NAME!);

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const storeName = searchParams.get("storeName");

    if (!userId || !id || !storeName) {
      return NextResponse.json({ error: "Missing info" }, { status: 400 });
    }

    await index.namespace(storeName).deleteOne({id: id}); 

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}