import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

function hasAdminRole(role: unknown) {
  return typeof role === "string" && role.toLowerCase() === "admin";
}

export async function isAdmin() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) return false;

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const metadataRoles = [
      clerkUser.publicMetadata?.role,
      clerkUser.privateMetadata?.role,
      clerkUser.unsafeMetadata?.role,
    ];

    if (metadataRoles.some(hasAdminRole)) return true;

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    return dbUser?.role === "ADMIN";
  } catch (error) {
    console.warn("Admin check failed:", error);
    return false;
  }
}
