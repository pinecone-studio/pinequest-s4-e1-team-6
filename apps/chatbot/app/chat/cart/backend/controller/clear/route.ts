import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/service/auth";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const user = await getUserFromToken();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Нэвтрэх шаардлагатай" },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!cart) {
      return NextResponse.json({ message: "Сагс аль хэдийн хоосон байна" });
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return NextResponse.json({
      message: "Сагс амжилттай цэвэрлэгдлээ",
    });
  } catch (error) {
    console.error("Cart clear error:", error);
    return NextResponse.json(
      { error: "Сагс цэвэрлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}