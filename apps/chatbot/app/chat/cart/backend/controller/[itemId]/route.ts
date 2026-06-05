import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params; 
  const { quantity } = await req.json();

  const updatedItem = await prisma.cartItem.update({
    where: {
      id: itemId,
    },
    data: {
      quantity,
    },
  });

  return Response.json(updatedItem);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }, 
) {
  const { itemId } = await params; 

  await prisma.cartItem.delete({
    where: {
      id: itemId,
    },
  });

  return Response.json({
    message: "Item removed",
  });
}