"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function updateAdminPassword(data: { password: string }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: "Нэвтрээгүй байна." };
    }

    const client = await clerkClient();

    await client.users.updateUser(userId, {
      password: data.password,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Clerk Update Error:", error);
    return { 
      success: false, 
      error: error.errors?.[0]?.longMessage || "Нууц үг шинэчлэхэд алдаа гарлаа." 
    };
  }
}