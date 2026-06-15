"use client";

import { useEffect, useState } from "react";

type S = {
  id: string;
  name: string;
  status: string;
  description: string | null;
  createdAt: string;
  owner: { name: string | null; email: string | null };
  phone: string | null;
  registerNumber: string | null;
  idCardImage: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
};
const badge: Record<string, string> = {
  APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
};
const label: Record<string, string> = {
  APPROVED: "Баталгаажсан",
  PENDING: "Хүлээгдэж буй",
  REJECTED: "Татгалзсан",
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<S[]>([]);
  const [filter, setFilter] = useState<string>("ALL");

  const load = async () => {
    const res = await fetch("/admin/api/stores");
    const data = await res.json();
    setStores(data.stores ?? []);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const act = async (
    storeId: string,
    action: "approve" | "reject" | "delete",
  ) => {
    if (
      action === "delete" &&
      !window.confirm("Энэ татгалзсан дэлгүүрийг бүр мөсөн устгах уу?")
    ) {
      return;
    }

    await fetch("/admin/api/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, action }),
    });
    load();
  };

  const shown = stores.filter((s) => filter === "ALL" || s.status === filter);
  const pendingCount = stores.filter((s) => s.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">
          Дэлгүүрүүд{" "}
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-[#7c5cff] px-2.5 py-1 text-xs font-bold">
              {pendingCount} шинэ хүсэлт
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-[#7c5cff] text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {f === "ALL" ? "Бүгд" : label[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {shown.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-lg">{s.name}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge[s.status]}`}
                  >
                    {label[s.status] ?? s.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Эзэн: {s.owner?.name ?? s.owner?.email ?? "?"} ·{" "}
                  {new Date(s.createdAt).toLocaleDateString("mn-MN")}
                </p>
                {s.description && (
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-white/5 p-3 text-sm text-slate-300">
                    {s.description}
                  </p>
                )}

                {/* KYC — баталгаажуулах мэдээлэл */}
                {(s.registerNumber || s.idCardImage || s.bankName) && (
                  <div className="mt-3 rounded-xl border border-[#7c5cff]/20 bg-[#7c5cff]/5 p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9b8cff]">
                      Баталгаажуулалт (KYC)
                    </p>
                    <div className="flex flex-wrap items-start gap-4">
                      {s.idCardImage && (
                        <a
                          href={s.idCardImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block shrink-0"
                          title="Томруулж харах"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.idCardImage}
                            alt="Үнэмлэх"
                            className="h-24 w-36 rounded-lg border border-white/10 object-cover transition-transform group-hover:scale-[1.02]"
                          />
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 text-xs font-bold text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                            🔍 Томруулах
                          </span>
                        </a>
                      )}
                      <div className="grid grid-cols-1 gap-y-1 text-xs text-slate-300 sm:grid-cols-2 sm:gap-x-6">
                        {s.phone && (
                          <p>
                            <span className="text-slate-500">Утас:</span>{" "}
                            {s.phone}
                          </p>
                        )}
                        {s.registerNumber && (
                          <p>
                            <span className="text-slate-500">Регистр:</span>{" "}
                            <span className="font-mono font-bold text-white">
                              {s.registerNumber}
                            </span>
                          </p>
                        )}
                        {s.bankName && (
                          <p>
                            <span className="text-slate-500">Банк:</span>{" "}
                            {s.bankName}
                          </p>
                        )}
                        {s.bankAccountNumber && (
                          <p>
                            <span className="text-slate-500">Данс:</span>{" "}
                            <span className="font-mono">
                              {s.bankAccountNumber}
                            </span>
                          </p>
                        )}
                        {s.bankAccountHolder && (
                          <p className="sm:col-span-2">
                            <span className="text-slate-500">Эзэмшигч:</span>{" "}
                            {s.bankAccountHolder}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {s.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => act(s.id, "approve")}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 transition-all"
                    >
                      Батлах
                    </button>
                    <button
                      onClick={() => act(s.id, "reject")}
                      className="rounded-xl bg-red-600/80 px-4 py-2 text-sm font-semibold hover:bg-red-600 transition-all"
                    >
                      Татгалзах
                    </button>
                  </>
                )}
                {s.status === "REJECTED" && (
                  <button
                    onClick={() => act(s.id, "delete")}
                    className="rounded-xl bg-red-600/80 px-4 py-2 text-sm font-semibold hover:bg-red-600 transition-all"
                  >
                    Устгах
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <p className="p-8 text-center text-slate-500">Дэлгүүр олдсонгүй</p>
        )}
      </div>
    </div>
  );
}
