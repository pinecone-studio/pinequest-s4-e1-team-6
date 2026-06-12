import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getRole() {
  const { userId } = await auth();
  if (!userId) return null;
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });
  return dbUser?.role ?? null;
}

export async function isAdmin() {
  return (await getRole()) === "ADMIN";
}

export async function isStoreOwner() {
  const role = await getRole();
  return role === "STORE_OWNER" || role === "ADMIN";
}
