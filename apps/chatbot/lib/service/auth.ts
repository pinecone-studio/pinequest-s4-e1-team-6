import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null; 

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing");
      return null;
    }

    return jwt.verify(token, secret) as { id: string };
  } catch (error) {
    return null;
  }
}