// import { auth, clerkClient } from "@clerk/nextjs/server";

// export async function isAdmin() {
//   const { userId } = await auth();

//   if (!userId) return false;

//   const client = await clerkClient();
//   const user = await client.users.getUser(userId);

//   return user.publicMetadata.role === "admin";
// }



import { auth, clerkClient } from "@clerk/nextjs/server";

export async function isAdmin() {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) return false;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return user.publicMetadata?.role === "admin";
  } catch (error) {
    console.warn("Clerk Auth is not ready yet or route is not matched.");
    return false;
  }
}