"use client";

import { useState } from "react";
import { CheckCircle2, ImageIcon, Loader2, Upload } from "lucide-react";

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

const BANKS = [
  "Хаан банк",
  "Голомт банк",
  "Худалдаа хөгжлийн банк",
  "Төрийн банк",
  "Хас банк",
  "Капитрон банк",
  "Ариг банк",
  "Богд банк",
  "М банк",
  "Бусад",
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/30";

const REGISTER_REGEX = /^[А-ЯЁӨҮ]{2}\d{8}$/u;

export default function RequestStoreForm() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    phone: "",
    products: "",
    description: "",
    social: "",
    registerNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
  });
  const [idCardImage, setIdCardImage] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdCardPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "my_store_preset");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dzljgphud/image/upload",
        { method: "POST", body: data },
      );
      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      setIdCardImage(json.secure_url);
    } catch {
      setError("Зураг хуулахад алдаа гарлаа, дахин оролдоно уу.");
      setIdCardPreview("");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim()) return setError("Дэлгүүрийн нэрээ оруулна уу.");
    if (!form.category) return setError("Үйл ажиллагааны чиглэлээ сонгоно уу.");
    if (!/^\d{8}$/.test(form.phone.trim()))
      return setError("Утасны дугаараа 8 оронтой тоогоор оруулна уу.");
    if (!form.products.trim())
      return setError("Ямар бараа зарахаа товч бичнэ үү.");
    if (!REGISTER_REGEX.test(form.registerNumber.trim().toUpperCase()))
      return setError(
        "Регистрийн дугаарыг 2 үсэг + 8 тоогоор оруулна уу. Жишээ: УБ12345678",
      );
    if (uploading) return setError("Зураг хуулагдаж дуусахыг түр хүлээнэ үү.");
    if (!idCardImage)
      return setError("Иргэний үнэмлэхний зургаа оруулна уу.");
    if (!form.bankName) return setError("Банкаа сонгоно уу.");
    if (!/^\d{6,20}$/.test(form.bankAccountNumber.trim()))
      return setError("Дансны дугаараа зөв оруулна уу.");
    if (!form.bankAccountHolder.trim())
      return setError("Данс эзэмшигчийн нэрийг оруулна уу.");

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
        body: JSON.stringify({
          name: form.name.trim(),
          description,
          phone: form.phone.trim(),
          registerNumber: form.registerNumber.trim().toUpperCase(),
          idCardImage,
          bankName: form.bankName,
          bankAccountNumber: form.bankAccountNumber.trim(),
          bankAccountHolder: form.bankAccountHolder.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) setDone(true);
      else setError(data.error || "Алдаа гарлаа, дахин оролдоно уу.");
    } catch {
      setError("Сүлжээний алдаа гарлаа, дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[#7c5cff]" />
        <h2 className="text-xl font-bold">Хүсэлт амжилттай илгээгдлээ!</h2>
        <p className="text-sm text-slate-400">
          Таны хүсэлт админ самбарт хүлээгдэж буй төлөвтэй орлоо. Админ бичиг
          баримтыг шалгаж баталсны дараа та худалдагчийн эрхтэй болно.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] p-[1.5px]">
      <div className="space-y-5 rounded-[14px] bg-slate-950/95 p-6 md:p-8">
        <Field label="Дэлгүүрийн нэр *">
          <input
            value={form.name}
            onChange={set("name")}
            placeholder="Жишээ: Urnukh Store"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Үйл ажиллагааны чиглэл *">
            <select
              value={form.category}
              onChange={set("category")}
              className={inputCls}
            >
              <option value="" className="bg-slate-950">
                Сонгоно уу...
              </option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-slate-950">
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Холбоо барих утас *">
            <input
              value={form.phone}
              onChange={set("phone")}
              placeholder="99112233"
              maxLength={8}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Ямар бараа зарах вэ? *">
          <input
            value={form.products}
            onChange={set("products")}
            placeholder="Жишээ: Брэндийн пүүз, спорт хувцас"
            className={inputCls}
          />
        </Field>

        <div className="h-px bg-white/10" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b7a6ff]">
          Баталгаажуулалт (KYC)
        </p>

        <Field label="Иргэний регистрийн дугаар *">
          <input
            value={form.registerNumber}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                registerNumber: e.target.value.toUpperCase(),
              }))
            }
            placeholder="УБ12345678"
            maxLength={10}
            className={inputCls}
          />
        </Field>

        <Field label="Иргэний үнэмлэхний зураг *">
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition-all ${
              idCardImage
                ? "border-[#7c5cff]/50 bg-[#7c5cff]/10"
                : "border-white/15 bg-white/5 hover:border-white/30"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleIdUpload}
              className="hidden"
            />
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#b7a6ff]" />
            ) : idCardImage ? (
              <ImageIcon className="h-5 w-5 text-[#b7a6ff]" />
            ) : (
              <Upload className="h-5 w-5 text-slate-400" />
            )}
            <span className="text-sm text-slate-300">
              {uploading
                ? "Хуулж байна..."
                : idCardImage
                  ? "Зураг орсон, солих бол дарна уу"
                  : "Үнэмлэхний зургаа оруулна уу"}
            </span>
          </label>
          {idCardPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={idCardPreview}
              alt="Үнэмлэх"
              className="mt-2 h-32 w-full rounded-xl border border-white/10 object-cover"
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Банк *">
            <select
              value={form.bankName}
              onChange={set("bankName")}
              className={inputCls}
            >
              <option value="" className="bg-slate-950">
                Сонгоно уу...
              </option>
              {BANKS.map((bank) => (
                <option key={bank} value={bank} className="bg-slate-950">
                  {bank}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Дансны дугаар *">
            <input
              value={form.bankAccountNumber}
              onChange={set("bankAccountNumber")}
              placeholder="5000123456"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Данс эзэмшигчийн нэр *">
          <input
            value={form.bankAccountHolder}
            onChange={set("bankAccountHolder")}
            placeholder="Овог Нэр"
            className={inputCls}
          />
        </Field>

        <div className="h-px bg-white/10" />

        <Field label="Сошиал хаяг (заавал биш)">
          <input
            value={form.social}
            onChange={set("social")}
            placeholder="Instagram / Facebook линк"
            className={inputCls}
          />
        </Field>

        <Field label="Дэлгүүрийн танилцуулга (заавал биш)">
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="Дэлгүүрийнхээ тухай товч бичнэ үү..."
            className={inputCls}
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={loading || uploading}
          className="w-full rounded-xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] py-3.5 font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(124,92,255,0.4)] disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Илгээж байна...
            </span>
          ) : (
            "Админд хүсэлт илгээх"
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          * тэмдэгтэй талбарууд заавал бөглөгдөнө
        </p>
      </div>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
