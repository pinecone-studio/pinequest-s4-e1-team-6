"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Store, Clock, LayoutDashboard, ShieldCheck } from "lucide-react";

type StoreStatus = {
  hasStore: boolean;
  role: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
};

export function SellerCTA({ collapsed }: { collapsed?: boolean }) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [info, setInfo] = useState<StoreStatus | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    fetch("/chat/api/store/request")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setInfo(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  if (!isLoaded || !isSignedIn || !info) return null;

  const role = info.role;
  // Эрх нь үндсэн шийдэгч: ADMIN → админ руу, STORE_OWNER → дэлгүүр рүү,
  // бусад тохиолдолд (USER) → худалдагч болох хүсэлт
  const isAdmin = role === "ADMIN";
  const isStoreOwner = role === "STORE_OWNER";
  const pending = !isAdmin && !isStoreOwner && info.hasStore && info.status === "PENDING";

  // Дизайн тус бүрийн тохиргоо
  let cfg: {
    label: string;
    sub: string;
    href: string;
    icon: typeof Store;
    tone: "violet" | "blue" | "amber";
  };

  if (isAdmin) {
    cfg = {
      label: "Админ хяналт",
      sub: "Удирдлагын самбар руу орох",
      href: "/admin",
      icon: ShieldCheck,
      tone: "blue",
    };
  } else if (isStoreOwner) {
    cfg = {
      label: "Миний дэлгүүр",
      sub: "Бараа, захиалгаа удирдах",
      href: "/store",
      icon: LayoutDashboard,
      tone: "violet",
    };
  } else {
    cfg = {
      label: "Худалдагч болох",
      sub: "Бараагаа манай сайтад байршуулж зараарай",
      href: "/request-store",
      icon: Store,
      tone: "violet",
    };
  }

  const Icon = cfg.icon;

  // Хүсэлт хянагдаж байгаа төлөв (зөвхөн энгийн хэрэглэгчид)
  if (pending) {
    if (collapsed) {
      return (
        <button
          onClick={() => router.push("/request-store")}
          title="Хүсэлт хүлээгдэж байна"
          className="mx-auto my-1 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300"
        >
          <Clock size={18} />
        </button>
      );
    }
    return (
      <button
        onClick={() => router.push("/request-store")}
        className="mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-left text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/15"
      >
        <Clock size={15} className="shrink-0" />
        Таны дэлгүүрийн хүсэлт хянагдаж байна
      </button>
    );
  }

  if (collapsed) {
    return (
      <button
        onClick={() => router.push(cfg.href)}
        title={cfg.label}
        className={`mx-auto my-1 flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:brightness-110 active:scale-95 ${
          cfg.tone === "blue"
            ? "bg-gradient-to-br from-[#56a8ff] to-[#3b82f6]"
            : "bg-gradient-to-br from-[#9f8cff] to-[#6f7bff]"
        }`}
      >
        <Icon size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push(cfg.href)}
      className={`group mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
        cfg.tone === "blue"
          ? "border-[#56a8ff]/30 bg-gradient-to-br from-[#56a8ff]/15 to-[#3b82f6]/10 hover:border-[#56a8ff]/50"
          : "border-[#9f8cff]/30 bg-gradient-to-br from-[#9f8cff]/15 to-[#6f7bff]/10 hover:border-[#9f8cff]/50"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${
          cfg.tone === "blue"
            ? "bg-gradient-to-br from-[#56a8ff] to-[#3b82f6]"
            : "bg-gradient-to-br from-[#9f8cff] to-[#6f7bff]"
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-800 dark:text-white">
          {cfg.label}
        </span>
        <span className="block text-[11px] leading-tight text-slate-500 dark:text-slate-400">
          {cfg.sub}
        </span>
      </span>
    </button>
  );
}
