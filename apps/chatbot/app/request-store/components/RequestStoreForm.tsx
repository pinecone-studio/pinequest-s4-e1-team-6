"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Upload,
  ImageIcon,
  ShieldCheck,
  MailCheck,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

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

  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const sendOtp = async () => {
    if (!email) return setError("Имэйл хаяг олдсонгүй. Дахин нэвтэрнэ үү.");
    if (!/^\d{8}$/.test(form.phone.trim()))
      return setError("Эхлээд утасны дугаараа зөв оруулна уу");

    setSendingOtp(true);
    setError("");
    try {
      const res = await fetch("/chat/api/store/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpCode(data.code);
        setOtpSent(true);
      } else {
        setError(data.error || "Код илгээхэд алдаа гарлаа");
      }
    } catch {
      setError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = () => {
    if (otpInput.trim() === otpCode && otpCode) {
      setOtpVerified(true);
      setError("");
    } else {
      setError("Баталгаажуулах код буруу байна");
    }
  };

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
      if (!res.ok) throw new Error();
      const json = await res.json();
      setIdCardImage(json.secure_url);
    } catch {
      setError("Зураг хуулахад алдаа гарлаа, дахин оролдоно уу");
      setIdCardPreview("");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim()) return setError("Дэлгүүрийн нэрээ оруулна уу");
    if (!form.category) return setError("Үйл ажиллагааны чиглэлээ сонгоно уу");
    if (!/^\d{8}$/.test(form.phone.trim()))
      return setError("Утасны дугаараа 8 оронтой тоогоор оруулна уу");
    if (!form.products.trim())
      return setError("Ямар бараа зарахаа товч бичнэ үү");
    if (!REGISTER_REGEX.test(form.registerNumber.trim().toUpperCase()))
      return setError(
        "Регистрийн дугаарыг 2 үсэг + 8 тоогоор оруулна уу (ж: УБ12345678)",
      );
    if (uploading) return setError("Зураг хуулж дуустал түр хүлээнэ үү");
    if (!idCardImage) return setError("Иргэний үнэмлэхний зургаа оруулна уу");
    if (!form.bankName) return setError("Банкаа сонгоно уу");
    if (!/^\d{6,20}$/.test(form.bankAccountNumber.trim()))
      return setError("Дансны дугаараа зөв оруулна уу");
    if (!form.bankAccountHolder.trim())
      return setError("Данс эзэмшигчийн нэрийг оруулна уу");
    if (!otpVerified)
      return setError("Имэйлээр ирсэн кодоор баталгаажуулалтаа хийнэ үү");

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
          Админ таны хүсэлт болон бичиг баримтыг хянаж баталсны дараа та
          худалдагчийн эрхтэй болно. Түр хүлээнэ үү.
        </p>
      </div>
    );

  return (
    <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff]">
      <div className="rounded-[14px] bg-slate-950/95 p-6 md:p-8 space-y-5">
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

        <div className="h-px bg-white/10" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b7a6ff]">
          Баталгаажуулалт (KYC)
        </p>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Иргэний регистрийн дугаар *
          </label>
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
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Иргэний үнэмлэхний зураг *
          </label>
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
                  ? "Зураг орсон — солих бол дарна уу"
                  : "Үнэмлэхний зургаа оруулах"}
            </span>
          </label>
          {idCardPreview && (
            <img
              src={idCardPreview}
              alt="Үнэмлэх"
              className="mt-2 h-32 w-full rounded-xl border border-white/10 object-cover"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Банк *
            </label>
            <select
              value={form.bankName}
              onChange={set("bankName")}
              className={inputCls}
            >
              <option value="" className="bg-slate-950">
                Сонгоно уу...
              </option>
              {BANKS.map((b) => (
                <option key={b} value={b} className="bg-slate-950">
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-400">
              Дансны дугаар *
            </label>
            <input
              value={form.bankAccountNumber}
              onChange={set("bankAccountNumber")}
              placeholder="5000123456"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">
            Данс эзэмшигчийн нэр *
          </label>
          <input
            value={form.bankAccountHolder}
            onChange={set("bankAccountHolder")}
            placeholder="Овог Нэр"
            className={inputCls}
          />
        </div>

        <div className="h-px bg-white/10" />
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

        <div className="h-px bg-white/10" />
        <div className="rounded-xl border border-[#7c5cff]/25 bg-[#7c5cff]/5 p-4 space-y-3">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b7a6ff]">
            <ShieldCheck size={14} /> Имэйл баталгаажуулалт *
          </p>
          {otpVerified ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 size={16} /> Имэйл амжилттай баталгаажлаа
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Таны{" "}
                <span className="font-semibold text-slate-200">{email}</span>{" "}
                хаяг руу баталгаажуулах 6 оронтой код илгээнэ.
              </p>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#7c5cff]/40 bg-[#7c5cff]/15 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#7c5cff]/25 disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Илгээж
                      байна...
                    </>
                  ) : (
                    <>
                      <MailCheck size={16} /> Имэйлээр код авах
                    </>
                  )}
                </button>
              ) : (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={otpInput}
                      onChange={(e) =>
                        setOtpInput(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="6 оронтой код"
                      inputMode="numeric"
                      maxLength={6}
                      className={`${inputCls} flex-1 tracking-[0.3em]`}
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      className="rounded-xl bg-gradient-to-r from-[#9f8cff] to-[#6f7bff] px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110"
                    >
                      Баталгаажуулах
                    </button>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={sendingOtp}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 transition-all hover:text-white disabled:opacity-50"
                    >
                      Дахин илгээх
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Код ирэхгүй бол спам (Spam/Junk) хавтсаа шалгаарай.
                  </p>
                </>
              )}
            </>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading || uploading}
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
