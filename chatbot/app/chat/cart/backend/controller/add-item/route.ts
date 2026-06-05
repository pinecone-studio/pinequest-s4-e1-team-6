import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/service/auth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken().catch(() => null); 
    if (!user || !user.id) {
      return Response.json({ message: "Нэвтрэх шаардлагатай" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return Response.json({ message: "Бүтээгдэхүүн олдсонгүй" }, { status: 404 });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
        price: product.price,
      }
    });

    return Response.json({ message: "Амжилттай нэмэгдлээ" });

  } catch (error) {
    console.error("Cart Error:", error);
    return Response.json({ message: "Сервер талд алдаа гарлаа" }, { status: 500 });
  }
}