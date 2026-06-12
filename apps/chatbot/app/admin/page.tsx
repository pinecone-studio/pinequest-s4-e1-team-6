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
      href: "/admin/stores",
    },
    {
      label: "Нийт захиалга",
      value: orderCount,
      icon: ShoppingCart,
      href: "/admin/stores",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Админ удирдлага</h1>
        <p className="text-sm text-slate-400 mt-1">Системийн ерөнхий байдал</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl border p-6 transition-all hover:bg-white/5 ${
              c.highlight
                ? "border-[#7c5cff] bg-[#7c5cff]/10"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <c.icon className="h-6 w-6 text-[#9b8cff] mb-3" />
            <p className="text-3xl font-black">{c.value}</p>
            <p className="text-sm text-slate-400 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
