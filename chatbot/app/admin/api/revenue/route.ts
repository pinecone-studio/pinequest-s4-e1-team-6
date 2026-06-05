import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany();

  const grouped: Record<string, number> = {};

  orders.forEach((o) => {
    const date = o.createdAt.toISOString().split("T")[0];

    if (!grouped[date]) grouped[date] = 0;

    grouped[date] += o.price * o.quantity || o.price || 0;
  });

  return Response.json({
    success: true,
    data: Object.entries(grouped).map(([date, total]) => ({
      date,
      total,
    })),
  });
}
