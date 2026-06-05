import { prisma } from "@/lib/prisma";
 
type ClerkUserLike = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddresses?: Array<{
    id: string;
    emailAddress: string;
  }>;
  primaryEmailAddressId?: string | null;
};
 
export async function getOrCreateUser(clerkUser: ClerkUserLike) {
  const primaryEmail =
    clerkUser.emailAddresses?.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    "";
 
  if (!primaryEmail) {
    throw new Error("User email not found");
  }
 
  const fullName =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
 
  const dbUser = await prisma.user.upsert({
    where: {
      clerkUserId: clerkUser.id,
    },
    update: {
      email: primaryEmail,
      name: fullName,
      imageUrl: clerkUser.imageUrl ?? null,
    },
    create: {
      clerkUserId: clerkUser.id,
      email: primaryEmail,
      name: fullName,
      imageUrl: clerkUser.imageUrl ?? null,
      password: ""
    },
  });
  return dbUser;
}