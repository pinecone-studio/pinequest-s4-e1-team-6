"use client";

import { Fragment, useEffect, useState } from "react";

type OrderItem = {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
};

type Dispute = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  disputedAt: string | null;
  disputeReason: string | null;
  customerPhone: string;
  address: string;
  store: { name: string } | null;
  user: { name: string | null; email: string | null } | null;
  items: OrderItem[];
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/admin/api/disputes")
      .then((r) => r.json())
      .then((d) => setDisputes(Array.isArray(d.disputes) ? d.disputes : []))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const resolve = async (
    orderId: string,
    resolution: "REFUNDED" | "DELIVERED" | "CANCELLED",
  ) => {
    const labels: Record<string, string> = {
      REFUNDED: "буцаалт хийх",
      DELIVERED: "хүргэгдсэн гэж батлах",
      CANCELLED: "цуцлах",
    };
    if (!confirm(`Энэ маргааныг "${labels[resolution]}"-аар шийдвэрлэх үү?`))
      return;
    setBusy(orderId);
    try {
      await fetch("/admin/api/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, resolution }),
      });
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">
        Маргаантай захиалга{" "}
        <span className="text-slate-500">({disputes.length})</span>
      </h1>

      {loading ? (
        <p className="p-8 text-center text-slate-500">Уншиж байна…</p>
      ) : disputes.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <p className="text-4xl">✓</p>
          <p className="mt-3 text-slate-400">
            Идэвхтэй маргаан алга. Бүх захиалга хэвийн байна.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {disputes.map((d) => (
            <div
              key={d.id}
              className="overflow-hidden rounded-2xl border border-red-500/25 bg-red-500/[0.04]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-red-500/15 px-2 py-0.5 font-mono text-xs font-bold text-red-400">
                      #{d.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                      МАРГААНТАЙ
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    <span className="text-slate-500">Худалдан авагч:</span>{" "}
                    {d.user?.name ?? d.user?.email ?? "—"}{" "}
                    <span className="text-slate-600">·</span>{" "}
                    <span className="text-slate-500">Дэлгүүр:</span>{" "}
                    {d.store?.name ?? "—"}
                  </p>
                  <p className="text-sm text-slate-400">
                    <span className="text-slate-500">Дүн:</span>{" "}
                    <span className="font-bold text-amber-400">
                      {Number(d.totalAmount).toLocaleString()}₮
                    </span>{" "}
                    <span className="text-slate-600">·</span>{" "}
                    {d.disputedAt
                      ? new Date(d.disputedAt).toLocaleDateString("mn-MN")
                      : ""}
                  </p>

                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Маргааны шалтгаан
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      {d.disputeReason || "—"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setExpanded(expanded === d.id ? null : d.id)
                    }
                    className="mt-2 text-xs font-semibold text-[#9b8cff] hover:text-white"
                  >
                    {expanded === d.id ? "Барааг нуух ▴" : "Барааг харах ▾"}
                  </button>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    disabled={busy === d.id}
                    onClick={() => resolve(d.id, "REFUNDED")}
                    className="rounded-xl bg-amber-600/80 px-4 py-2 text-sm font-semibold transition-all hover:bg-amber-600 disabled:opacity-50"
                  >
                    Буцаалт хийх
                  </button>
                  <button
                    disabled={busy === d.id}
                    onClick={() => resolve(d.id, "DELIVERED")}
                    className="rounded-xl bg-emerald-600/80 px-4 py-2 text-sm font-semibold transition-all hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Хүргэгдсэн гэж батлах
                  </button>
                  <button
                    disabled={busy === d.id}
                    onClick={() => resolve(d.id, "CANCELLED")}
                    className="rounded-xl bg-red-600/80 px-4 py-2 text-sm font-semibold transition-all hover:bg-red-600 disabled:opacity-50"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>

              {expanded === d.id && (
                <div className="border-t border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-2">
                    {d.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-xl bg-white/5 p-3"
                      >
                        {item.productImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productImage}
                            className="h-12 w-12 rounded-lg object-cover"
                            alt={item.productName}
                          />
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.quantity} ш ×{" "}
                            {Number(item.price).toLocaleString()}₮
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
