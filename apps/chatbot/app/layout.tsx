import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./chat/cart/frontend/components/CartSidebar";
import { Toaster } from "sonner";
import Navbar from "./chat/homeChat/product/Navbar";
import { isAdmin } from "@/lib/isAdmin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "chat-Store",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminStatus = await isAdmin();

  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="mn" suppressHydrationWarning>
        <body className={`${font.variable} font-sans antialiased bg-[#0D0D0D]`}>
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar isAdmin={adminStatus} />
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