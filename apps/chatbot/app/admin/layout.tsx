import { isAdmin } from "@/lib/roles";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingCart,
  ShieldAlert,
} from "lucide-react";

const NAV = [
  { name: "Дашбоард", href: "/admin", icon: LayoutDashboard },
  { name: "Дэлгүүрүүд", href: "/admin/stores", icon: Store },
  { name: "Хэрэглэгчид", href: "/admin/users", icon: Users },
  { name: "Бараа", href: "/admin/products", icon: Package },
  { name: "Захиалга", href: "/admin/orders", icon: ShoppingCart },
  { name: "Асуудал", href: "/admin/disputes", icon: ShieldAlert },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/");

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-60 shrink-0 border-r border-white/10 p-5 flex flex-col gap-1">
        <Link
          href="/admin"
          className="mb-6 flex items-center font-black text-lg select-none"
        >
          Chat
          <span className="ml-1.5 p-[1.5px] rounded-lg bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff]">
            <span className="block px-2 py-0.5 rounded-[6px] bg-slate-950 text-xs font-extrabold uppercase">
              Admin
            </span>
          </span>
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-300 transition-all hover:bg-white/5 hover:text-white"
          >
            <item.icon className="h-4 w-4 text-[#9b8cff]" />
            {item.name}
          </Link>
        ))}
        <Link
          href="/"
          className="mt-auto rounded-xl px-4 py-2.5 text-sm text-slate-500 hover:text-white transition-all"
        >
          ← Сайт руу буцах
        </Link>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
