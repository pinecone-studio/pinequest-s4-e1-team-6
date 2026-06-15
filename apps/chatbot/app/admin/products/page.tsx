"use client";

import { useEffect, useState } from "react";

type P = {
  id: string;
  namespace: string;
  name: string;
  price: number;
  stock: number;
  brand: string | null;
  image: string;
  storeName: string;
  status: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<P[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const res = await fetch("/admin/api/products");
    const data = await res.json();
    setProducts(data.products ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const del = async (id: string, namespace: string, name: string) => {
    if (!confirm(`"${name}" барааг устгах уу? Буцаах боломжгүй!`)) return;
    await fetch("/admin/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, namespace }),
    });
    load();
  };

  const shown = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Бараа ({products.length})</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Барааны нэрээр хайх..."
          className="w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none focus:border-[#7c5cff]"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Бараа</th>
              <th className="px-5 py-3">Дэлгүүр</th>
              <th className="px-5 py-3">Үнэ</th>
              <th className="px-5 py-3">Үлдэгдэл</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr
                key={p.id}
                className="border-t border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.brand && (
                        <p className="text-xs text-slate-500">{p.brand}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                  {p.storeName ?? "—"}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {p.price.toLocaleString()}₮
                </td>
                <td className="px-5 py-3">
                  {p.stock <= 0 ? (
                    <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
                      Дууссан
                    </span>
                  ) : (
                    <span className="text-slate-300">{p.stock} ширхэг</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => del(p.id, p.namespace, p.name)}
                    className="rounded-lg bg-red-600/20 border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-600/30 transition-all"
                  >
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && (
          <p className="p-8 text-center text-slate-500">Бараа олдсонгүй</p>
        )}
      </div>
    </div>
  );
}
