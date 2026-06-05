"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { LOCATION_DATA } from "./form1";
 
interface Props {
  onClose: () => void;
  onConfirm: () => void;
}
 
type FormData = {
  city: string;
  district: string;
  street: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
};
 
const initialFormData: FormData = {
  city: "",
  district: "",
  street: "",
  address: "",
  phone: "",
  lat: 47.9188,
  lng: 106.9176,
};
 
type FormErrors = Partial<Record<keyof Omit<FormData, "lat" | "lng">, string>>;
 
export default function OrderAddress({ onClose, onConfirm }: Props) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"city" | "district" | null>(
    null,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof Omit<FormData, "lat" | "lng">, boolean>>
  >({});
 
  const districtOptions = useMemo(() => {
    return formData.city ? (LOCATION_DATA[formData.city] ?? []) : [];
  }, [formData.city]);
 
  const LocationPicker = useMemo(
    () => dynamic(() => import("./LocationPicker"), { ssr: false }),
    [],
  );
 
  const validateField = (
    name: keyof Omit<FormData, "lat" | "lng">,
    value: string,
  ): string => {
    const trimmedValue = value.trim();
    switch (name) {
      case "city":
        return !trimmedValue ? "Хот эсвэл аймаг сонгох шаардлагатай." : "";
      case "district":
        return !trimmedValue ? "Дүүрэг эсвэл сум сонгох шаардлагатай." : "";
      case "street":
        if (!trimmedValue) return "Байр, орц, тоот мэдээллээ оруулна уу.";
        return "";
      case "address":
        if (!trimmedValue) return "Гудамж, хорооллын мэдээллээ оруулна уу.";
        return "";
      case "phone":
        if (!trimmedValue) return "Утасны дугаараа оруулна уу.";
        if (trimmedValue.length !== 8)
          return "Заавал 8 оронтой дугаар оруулна уу.";
        return "";
      default:
        return "";
    }
  };
 
  const handleMapChange = async (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setLoading(true);
    try {
      const response = await fetch(
        `/chat/api/reverse-geocode?lat=${lat}&lng=${lng}`,
      );
      if (!response.ok) throw new Error("Алдаа гарлаа");
      const data = await response.json();
      if (data.address) {
        const addr = data.address;
        const detectedStreet =
          addr.road || addr.suburb || addr.neighbourhood || "";
        const detectedDetail = [addr.house_number, addr.building]
          .filter(Boolean)
          .join(", ");
        setFormData((prev) => ({
          ...prev,
          address: detectedStreet || prev.address,
          street: detectedDetail || prev.street,
        }));
        if (detectedStreet) setErrors((prev) => ({ ...prev, address: "" }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
 
  const setFieldValue = (
    name: keyof Omit<FormData, "lat" | "lng">,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };
 
  const handleBlur = (name: keyof Omit<FormData, "lat" | "lng">) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };
 
  const handleSubmit = () => {
    const newErrors: FormErrors = {};
    (["city", "district", "street", "address", "phone"] as const).forEach(
      (f) => {
        const msg = validateField(f, formData[f]);
        if (msg) newErrors[f] = msg;
      },
    );
    setTouched({
      city: true,
      district: true,
      street: true,
      address: true,
      phone: true,
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) onConfirm();
  };
 
  const ErrorMsg = ({ field }: { field: keyof FormErrors }) => (
    <AnimatePresence>
      {touched[field] && errors[field] && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -5 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-1.5 px-2 mt-1.5"
        >
          <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-bold text-red-500 dark:text-red-400 leading-none">
            {errors[field]}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
 
  const getFieldClassName = (field: keyof FormErrors) => {
    const hasError = touched[field] && errors[field];
    return `w-full rounded-2xl border p-4 outline-none transition-all duration-300 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white ${
      hasError
        ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] focus:border-red-500"
        : "border-slate-200 dark:border-white/10 focus:border-[#077eef] focus:shadow-[0_0_20px_rgba(7,126,239,0.15)] focus:bg-white dark:focus:bg-white/10"
    }`;
  };
 
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md"
      />
 
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[40px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0f0f] shadow-2xl"
      >
        <div className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-7 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Хүргэлтийн хаяг
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 uppercase tracking-[0.2em] font-black">
            {loading
              ? "Байршил тогтоож байна..."
              : "Газрын зургаас байршлаа сонгоно уу"}
          </p>
        </div>
 
        <div className="custom-scrollbar flex max-h-[75vh] flex-col gap-6 overflow-y-auto p-8">
          <div className="w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm">
            <LocationPicker
              onLocationSelect={handleMapChange}
              initialPos={[formData.lat, formData.lng]}
            />
          </div>
 
          <div className="grid grid-cols-2 gap-4">
            <div className="relative flex flex-col gap-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#077eef]">
                Хот / Аймаг
              </label>
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "city" ? null : "city")
                }
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${touched.city && errors.city ? "border-red-500/50 bg-red-50" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:border-[#077eef]"}`}
              >
                <span
                  className={
                    !formData.city
                      ? "text-slate-400 dark:text-white/30"
                      : "font-medium"
                  }
                >
                  {formData.city || "Сонгох"}
                </span>
                <span className="text-[10px] opacity-50">▼</span>
              </button>
              <ErrorMsg field="city" />
              <AnimatePresence>
                {openDropdown === "city" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-[105%] z-50 max-h-[180px] w-full overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-2xl p-2"
                  >
                    {Object.keys(LOCATION_DATA).map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setFieldValue("city", city);
                          setOpenDropdown(null);
                        }}
                        className="w-full p-3 text-left text-sm text-slate-700 dark:text-white rounded-xl hover:bg-[#077eef] hover:text-white transition-colors font-medium"
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
 
            <div className="relative flex flex-col gap-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#077eef]">
                Дүүрэг / Сум
              </label>
              <button
                type="button"
                disabled={!formData.city}
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "district" ? null : "district",
                  )
                }
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${touched.district && errors.district ? "border-red-500/50 bg-red-50" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white hover:border-[#077eef]"} ${!formData.city && "opacity-30 cursor-not-allowed"}`}
              >
                <span
                  className={
                    !formData.district
                      ? "text-slate-400 dark:text-white/30"
                      : "font-medium"
                  }
                >
                  {formData.district || "Сонгох"}
                </span>
                <span className="text-[10px] opacity-50">▼</span>
              </button>
              <ErrorMsg field="district" />
              <AnimatePresence>
                {openDropdown === "district" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-[105%] z-50 max-h-[180px] w-full overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-2xl p-2"
                  >
                    {districtOptions.map((dist, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setFieldValue("district", dist);
                          setOpenDropdown(null);
                        }}
                        className="w-full p-3 text-left text-sm text-slate-700 dark:text-white rounded-xl hover:bg-[#077eef] hover:text-white transition-colors font-medium"
                      >
                        {dist}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
 
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#077eef]">
                Байр, Орц, Тоот
              </label>
              <input
                value={formData.street}
                onChange={(e) => setFieldValue("street", e.target.value)}
                onBlur={() => handleBlur("street")}
                className={getFieldClassName("street")}
                placeholder="Байр, Орц, Тоот..."
              />
              <ErrorMsg field="street" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#077eef]">
                Гудамж / Дэлгэрэнгүй
              </label>
              <input
                value={formData.address}
                onChange={(e) => setFieldValue("address", e.target.value)}
                onBlur={() => handleBlur("address")}
                className={getFieldClassName("address")}
                placeholder="Гудамжны нэр..."
              />
              <ErrorMsg field="address" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#077eef]">
                Холбоо барих дугаар
              </label>
              <input
                type="tel"
                maxLength={8}
                value={formData.phone}
                onChange={(e) =>
                  setFieldValue("phone", e.target.value.replace(/\D/g, ""))
                }
                onBlur={() => handleBlur("phone")}
                className={getFieldClassName("phone")}
                placeholder="88888888"
              />
              <ErrorMsg field="phone" />
            </div>
          </div>
 
          <button
            onClick={handleSubmit}
            className="w-full py-5 bg-[#077eef] hover:bg-[#066fd4] text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] uppercase tracking-widest text-sm mt-2"
          >
            Хаяг баталгаажуулах
          </button>
        </div>
      </motion.div>
    </div>
  );
}
 
 
 