import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, secret_token } = body;

    if (secret_token !== 'demo_secret_123') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (status === 'success') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
          paidAt: new Date() 
        },
      });
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ message: "Status is not success" });
  } catch (error) {
    console.error("WEBHOOK_ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}