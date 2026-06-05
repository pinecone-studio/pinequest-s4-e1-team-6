import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isAdminRoute(req)) {
    if (!userId) {
      if (req.nextUrl.pathname.includes("/api/")) {
        return NextResponse.json(
          { error: "Нэвтрэх шаардлагатай" },
          { status: 401 },
        );
      }
      return (await auth()).redirectToSignIn();
    }

    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const role = (user.publicMetadata as any)?.role;
      console.log("🔐 Role:", role, "UserId:", userId);

      if (role !== "admin") {
        return NextResponse.redirect(new URL("/chat", req.url));
      }
    } catch (e) {
      console.error("Clerk error:", e);
      return NextResponse.redirect(new URL("/chat", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
  '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};