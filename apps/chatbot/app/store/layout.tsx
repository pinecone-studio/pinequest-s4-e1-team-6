"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import Sidebar from "./components/layout/Sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "ТӨЛӨВ БАЙДАЛ",
  "/admin/products": "БҮТЭЭГДЭХҮҮН",
  "/admin/orders": "ЗАХИАЛГА",
  "/admin/stores": "ДЭЛГҮҮР",
  "/admin/users": "ХЭРЭГЛЭГЧ",
  "/admin/settings": "ТОХИРГОО",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "ТӨЛӨВ БАЙДАЛ";

  return (
    <div className="flex h-screen dark:bg-[#0D0D0D] overflow-hidden justify-evenly font-sans light:bg-[#F8F8F8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <header className="h-16 flex items-center justify-between md:px-8 px-5 border-b border-white/5 dark:bg-[#0D0D0D]/50 backdrop-blur-md z-30">
          <h2 className="dark:text-white/50 text-[15px] font-bold uppercase tracking-[0.3em] md:pl-0 pl-10">
            {title}
          </h2>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Удирдлага</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <Toaster richColors position="top-center" />
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}