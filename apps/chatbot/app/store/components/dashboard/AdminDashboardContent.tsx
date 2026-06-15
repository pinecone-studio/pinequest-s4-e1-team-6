"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../product/ProductForm";
import RevenueChart from "./RevenueChart";
import { useAppStore } from "../../store/useStore";

export default function AdminDashboardContent({
  initialStoreName,
  existingStores = [],
}: {
  initialStoreName: string | null;
  existingStores?: { id: string; name: string; description: string | null }[];
}) {
  const router = useRouter();
  const { storeName, setStoreName, isLoading, setIsLoading } = useAppStore();

  const [tempName, setTempName] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [existingStoreNotice, setExistingStoreNotice] = useState<string | null>(
    existingStores.length > 0
      ? `Танд өмнө үүсгэсэн "${existingStores[0].name}" дэлгүүр байна.`
      : null,
  );
  const [products, setProducts] = useState<unknown[]>([]);
  const [orders, setOrders] = useState<{ totalAmount?: number }[]>([]);
  const [storeLogo, setStoreLogo] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    const checkStore = async () => {
      if (initialStoreName) {
        setStoreName(initialStoreName);
        setIsLoading(false);
      } else if (existingStores.length > 0) {
        setStoreName(existingStores[0].name);
        setIsLoading(false);
      } else {
        try {
          const res = await fetch("/store/api/get-store");
          const data = await res.json();
          if (data.success && data.storeName) {
            setStoreName(data.storeName);
          }
        } catch (e) {
          console.error("Store ачаалахад алдаа гарлаа:", e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkStore();
  }, [initialStoreName, existingStores, setStoreName, setIsLoading]);

  const handleSetupStore = async () => {
    if (!tempName.trim()) return;
    setIsSettingUp(true);

    try {
      const res = await fetch("/store/api/create-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tempName.trim(),
          description: "Миний шинэ дэлгүүр",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStoreName(data.storeName || tempName.trim());
        router.refresh();
        fetchProducts();
      } else if (res.status === 409 && data.existingStore?.name) {
        setExistingStoreNotice(
          `Танд аль хэдийн "${data.existingStore.name}" дэлгүүр байна. Тэр дэлгүүрээрээ үргэлжлүүлэн орлоо.`,
        );
        setStoreName(data.existingStore.name);
        router.refresh();
      } else {
        alert(data.error || "Хадгалахад алдаа гарлаа.");
      }
    } catch (error) {
      console.error(error);
      alert("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const fetchProducts = async () => {
    if (!storeName) return;
    try {
      const res = await fetch(
        `/store/api/productAllGet?storeName=${encodeURIComponent(storeName)}`,
      );
      const data = await res.json();
      if (data.success) {
        setProducts(Array.isArray(data.products) ? data.products : []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    if (!storeName) return;
    try {
      const res = await fetch(
        `/store/api/orders?storeName=${encodeURIComponent(storeName)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      setOrders(
        Array.isArray(data)
          ? (data as { totalAmount?: number }[])
          : [],
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (storeName) {
      fetchProducts();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrders();
    }
  }, [storeName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!storeName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-900 dark:text-white transition-colors duration-300 px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl italic mb-6 sm:mb-8 text-center">
          Дэлгүүрийн нэрээ бүртгүүлнэ үү!
        </h1>

        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-gray-800 w-full max-w-sm sm:max-w-md shadow-2xl">
          <div className="space-y-4 sm:space-y-6">
            {existingStoreNotice && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                {existingStoreNotice}
              </div>
            )}

            {existingStores.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold ml-2 uppercase tracking-widest">
                  Өмнөх дэлгүүр
                </label>
                <div className="space-y-2">
                  {existingStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setStoreName(store.name)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800 p-3 text-left text-sm font-bold text-slate-900 dark:text-white hover:border-indigo-500 transition"
                    >
                      {store.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">

<label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold ml-2 uppercase tracking-widest">

Шинэ дэлгүүрийн нэр

</label>

<input

className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 p-3 sm:p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-gray-500 text-sm sm:text-base"

value={tempName}

onChange={(e) => setTempName(e.target.value)}

placeholder="Жишээ: High-Tech Store"

/>

</div> 

       {/* Дэлгүүрийн профайл зураг оруулах хэсэг */}
<div className="space-y-2">
  <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold ml-2 uppercase tracking-widest">
    Дэлгүүрийн профайл зураг
  </label>
  
  <div className="flex items-center gap-4 p-3 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl">
    {/* Зургийг урьдчилж харах хэсэг */}
    <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-xl border border-slate-200 dark:border-gray-600 flex items-center justify-center overflow-hidden text-xl shrink-0">
      {logoPreview ? (
        <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        "🏪"
      )}
    </div>

    {/* Файл сонгох input */}
    <input
      type="file"
      accept="image/*"
      className="block w-full text-xs text-slate-500 dark:text-gray-400
        file:mr-4 file:py-2 file:px-4
        file:rounded-xl file:border-0
        file:text-xs file:font-bold
        file:bg-indigo-50 file:text-indigo-700
        dark:file:bg-indigo-950/40 dark:file:text-indigo-400
        hover:file:bg-indigo-100 dark:hover:file:bg-indigo-950/60
        cursor-pointer"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setStoreLogo(file);
          setLogoPreview(URL.createObjectURL(file)); // Зургийг шууд харуулах холбоос үүсгэх
        }
      }}
    />
  </div>
</div>

            <button
              onClick={handleSetupStore}
              disabled={isSettingUp}
              className="w-full bg-indigo-600 py-3 sm:py-4 rounded-2xl font-bold text-white text-sm sm:text-base hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {isSettingUp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Хадгалж байна...</span>
                </>
              ) : (
                "Дэлгүүр үүсгэх"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic text-slate-900 dark:text-white">
            {storeName}
          </h1>
        </div>
        <div className="w-full sm:w-auto">
          <ProductForm
            key={storeName}
            storeName={storeName}
            onSuccess={fetchProducts}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/10">
          <p className="opacity-70 text-xs sm:text-sm font-bold uppercase tracking-wider">
            Нийт бараа
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 sm:mt-2">
            {products.length}
          </h2>
        </div>
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-indigo-600 border border-white/10 text-white">
          <p className="opacity-70 text-xs sm:text-sm font-bold uppercase tracking-wider">
            Захиалга
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 sm:mt-2">
            {orders.length}
          </h2>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-slate-100 dark:bg-white/5 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 border border-slate-200 dark:border-white/10">
        <RevenueChart orders={orders} />
      </div>
    </div>
  );
}
