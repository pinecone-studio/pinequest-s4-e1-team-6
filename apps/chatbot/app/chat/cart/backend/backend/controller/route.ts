export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/service/auth";

// export async function GET() {
//   const user = await getUserFromToken();

//   const cart = await prisma.cart.findUnique({
//     where: { userId: user.id },
//     include: {
//       items: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });

//   return Response.json(cart);
// }

export async function GET() {
  try {
    const user = await getUserFromToken();
    
    if (!user || !user.id) {
      return Response.json({ items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { 
        items: { 
          include: { 
            product: true 
          } 
        } 
      },
    });

    return Response.json(cart ?? { items: [] });
  } catch (error) {
    console.error("CART_GET_ERROR:", error);
    return Response.json({ items: [], error: "Сагсны мэдээлэл авахад алдаа гарлаа" }, { status: 500 });
  }
}