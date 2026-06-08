import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const pathname = req.nextUrl.pathname;
  const port = req.nextUrl.port;

  if (port === "3001") {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (pathname === "/chat" || pathname.startsWith("/chat/")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (port === "3000" && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    "/(api|trpc)(.*)",
  ],
};
