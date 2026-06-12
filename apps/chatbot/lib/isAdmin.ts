import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

function hasAdminRole(role: unknown) {
  if (typeof role !== "string") return false;

  const normalizedRole = role.toUpperCase();
  return normalizedRole === "ADMIN" || normalizedRole === "STORE_OWNER";
}

function readRole(meta: unknown) {
  return (meta as Record<string, unknown> | null | undefined)?.role;
}

export async function isAdmin() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) return false;

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const metadataRoles = [
      readRole(clerkUser.publicMetadata),
      readRole(clerkUser.privateMetadata),
      readRole(clerkUser.unsafeMetadata),
    ];

    if (metadataRoles.some(hasAdminRole)) return true;

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    return dbUser?.role === "ADMIN" || dbUser?.role === "STORE_OWNER";
  } catch (error) {
    console.warn("Admin check failed:", error);
    return false;
  }
}
