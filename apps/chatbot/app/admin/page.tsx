import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Store, Users, Package, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [userCount, storeCount, pendingCount, productCount, orderCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.store.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.order.count(),
    ]);

  const cards = [
    {
      label: "Нийт хэрэглэгч",
      value: userCount,
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Нийт дэлгүүр",
      value: storeCount,
      icon: Store,
      href: "/admin/stores",
    },
    {
      label: "Хүлээгдэж буй хүсэлт",
      value: pendingCount,
      icon: Store,
      href: "/admin/stores",
      highlight: pendingCount > 0,
    },
    {
      label: "Нийт бараа",
      value: productCount,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Нийт захиалга",
      value: orderCount,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Админ удирдлага</h1>
        <p className="text-sm text-slate-400 mt-1">Системийн ерөнхий байдал</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-0.5 ${
              c.highlight
                ? "border-[#7c5cff]/60 bg-[#7c5cff]/10 hover:bg-[#7c5cff]/15"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  c.highlight ? "bg-[#7c5cff]/25" : "bg-white/5"
                }`}
              >
                <c.icon className="h-5 w-5 text-[#9b8cff]" />
              </span>
              {c.highlight && (
                <span className="rounded-full bg-[#7c5cff] px-2 py-0.5 text-[10px] font-bold uppercase">
                  Шинэ
                </span>
              )}
            </div>
            <p className="text-3xl font-black">{c.value}</p>
            <p className="mt-1 text-sm text-slate-400">{c.label}</p>
            <span className="absolute right-5 bottom-5 text-slate-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
