"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Хувцас, загвар",
  "Гутал",
  "Гоо сайхан",
  "Цахилгаан бараа",
  "Спорт, фитнесс",
  "Гэр ахуй",
  "Хүнс",
  "Бусад",
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/30";

export default function RequestStoreForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    phone: "",
    products: "",
    description: "",
    social: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return setError("Дэлгүүрийн нэрээ оруулна уу");
    if (!form.category) return setError("Үйл ажиллагааны чиглэлээ сонгоно уу");
    if (!/^\d{8}$/.test(form.phone.trim()))
      return setError("Утасны дугаараа 8 оронтой тоогоор оруулна уу");
    if (!form.products.trim())
      return setError("Ямар бараа зарахаа товч бичнэ үү");

    setError("");
    setLoading(true);
    try {
      const description = [
        `Чиглэл: ${form.category}`,
        `Утас: ${form.phone.trim()}`,
        `Зарах бараа: ${form.products.trim()}`,
        form.social.trim() && `Сошиал: ${form.social.trim()}`,
        form.description.trim() && `Танилцуулга: ${form.description.trim()}`,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/chat/api/store/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), description }),
      });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.error || "Алдаа гарлаа, дахин оролдоно уу");
    } catch {
      setError("Сүлжээний алдаа гарлаа, дахин оролдоно уу");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-10 text-center space-y-4">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#7c5cff]" />
        <h2 className="text-xl font-bold">Хүсэлт амжилттай илгээгдлээ!</h2>
        <p className="text-sm text-slate-400">
          Админ таны хүсэлтийг хянаж баталсны дараа та худалдагчийн эрхтэй
          болно. Түр хүлээнэ үү.
        </p>
      </div>
    );

  return (
    <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff]">
      <div className="rounded-[14px] bg-slate-950/95 p-6 md:p-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Дэлгүүрийн нэр *
          </label>
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Жишээ: Urnukh Store"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Үйл ажиллагааны чиглэл *
            </label>
            <select
              value={form.category}
              onChange={set("category")}
              className={inputCls}
            >
              <option value="" className="bg-slate-950">
                Сонгоно уу...
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-950">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Холбоо барих утас *
            </label>
            <input
              value={form.phone}
              onChange={set("phone")}
              placeholder="99112233"
              maxLength={8}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Ямар бараа зарах вэ? *
          </label>
          <input
            value={form.products}
            onChange={set("products")}
            placeholder="Жишээ: Брэндийн пүүз, спорт хувцас"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Сошиал хаяг (заавал биш)
          </label>
          <input
            value={form.social}
            onChange={set("social")}
            placeholder="Instagram / Facebook линк"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Дэлгүүрийн танилцуулга (заавал биш)
          </label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="Дэлгүүрийнхээ тухай товч бичнэ үү..."
            className={inputCls}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] py-3.5 font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(124,92,255,0.4)] disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Илгээж байна...
            </span>
          ) : (
            "Хүсэлт илгээх"
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          * тэмдэгтэй талбарууд заавал бөглөгдөнө
        </p>
      </div>
    </div>
  );
}
