"use client";

import { useEffect, useState } from "react";

type U = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  storeName: string | null;
};
const ROLES = ["USER", "STORE_OWNER", "ADMIN"];
const badge: Record<string, string> = {
  ADMIN: "bg-[#7c5cff]/20 text-[#9b8cff] border-[#7c5cff]/40",
  STORE_OWNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  USER: "bg-white/5 text-slate-400 border-white/10",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<U[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const res = await fetch("/admin/api/users");
    const data = await res.json();
    setUsers(data.users ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId: string, role: string) => {
    if (!confirm(`Энэ хэрэглэгчийг ${role} болгох уу?`)) return;
    await fetch("/admin/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    load();
  };

  const filtered = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Хэрэглэгчид</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Нэр, имэйлээр хайх..."
          className="w-64 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none focus:border-[#7c5cff]"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Нэр</th>
              <th className="px-5 py-3">Имэйл</th>
              <th className="px-5 py-3">Дэлгүүр</th>
              <th className="px-5 py-3">Эрх</th>
              <th className="px-5 py-3 text-right">Эрх солих</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-t border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3 whitespace-nowrap">{u.name ?? "—"}</td>
                <td className="px-5 py-3 text-slate-400">
                  <span
                    className="block max-w-[240px] truncate"
                    title={u.email ?? ""}
                  >
                    {u.email ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                  {u.storeName ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${badge[u.role] ?? badge.USER}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-[#7c5cff]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="text-black">
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-slate-500">Хэрэглэгч олдсонгүй</p>
        )}
      </div>
    </div>
  );
}
