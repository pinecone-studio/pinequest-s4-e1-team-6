<<<<<<< HEAD:apps/chatbot/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const port = req.nextUrl.port;

  if (port === "3001") {
    if (
      pathname === "/" ||
      pathname === "/chat" ||
      pathname.startsWith("/chat/")
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (isAdminRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});
=======
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(() => {});
>>>>>>> origin/main:apps/chatbot/middleware.ts

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
