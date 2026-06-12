import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/store(.*)"]);
const isStoreRoute = createRouteMatcher(["/store(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  const port = req.nextUrl.port;

  if (port === "3001") {
    if (
      pathname === "/" ||
      pathname === "/chat" ||
      pathname.startsWith("/chat/")
    ) {
      return NextResponse.redirect(new URL("/store", req.url));
    }
  }

  if (isAdminRoute(req) || isStoreRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
