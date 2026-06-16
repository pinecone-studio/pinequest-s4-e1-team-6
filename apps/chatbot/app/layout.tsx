import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./chat/cart/frontend/components/CartSidebar";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "chat-Store",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="mn" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem={true}
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors position="top-right" />

              <CartSidebar />
            </ThemeProvider>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
