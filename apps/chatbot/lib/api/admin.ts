import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
export async function isAdmin() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return false;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true } // Зөвхөн role талбарыг татаж авна
  });

  return user?.role === "ADMIN"; 
}