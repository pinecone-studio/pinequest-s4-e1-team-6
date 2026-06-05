"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../product/ProductForm";
import RevenueChart from "./RevenueChart";
import { useAppStore } from "../../store/useStore";
 
export default function AdminDashboardContent({
  initialStoreName,
  userId,
}: {
  initialStoreName: string | null;
  userId: string;
}) {
  const router = useRouter();
  const { storeName, setStoreName, isLoading, setIsLoading } = useAppStore();
 
  const [tempName, setTempName] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
 
  useEffect(() => {
    const checkStore = async () => {
      if (initialStoreName) {
        setStoreName(initialStoreName);
        setIsLoading(false);
      } else {
        try {
          const res = await fetch("/admin/api/get-store");
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
  }, [initialStoreName, setStoreName, setIsLoading]);
 
  // const handleSetupStore = async () => {
  //   if (!tempName.trim()) return;
  //   setIsSettingUp(true);
 
  //   try {
  //     const res = await fetch("/admin/api/setup-store", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ storeName: tempName.trim() }),
  //     });
 
  //     if (res.ok) {
  //       setStoreName(tempName.trim());
  //       router.refresh();
  //     } else {
  //       alert("Хадгалахад алдаа гарлаа.");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     alert("Сервертэй холбогдоход алдаа гарлаа.");
  //   } finally {
  //     setIsSettingUp(false);
  //   }
  // };
 
  const handleSetupStore = async () => {
    if (!tempName.trim()) return;
    setIsSettingUp(true);
 
    try {
      // 1. Prisma-д Store үүсгэх API руу хандах
      // Энэ API нь баазад дэлгүүрийг чинь бүртгэж, таны userId-тай холбоно
      const res = await fetch("/admin/api/create-store", {
        // Замыг анхаарна уу
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tempName.trim(), // API-д 'name' гэж очих ёстой
          description: "Миний шинэ дэлгүүр", // Шаардлагатай бол
        }),
      });
 
      const data = await res.json();
 
      if (res.ok && data.success) {
        // 2. Фронт-энд дээр storeName-ийг хадгалж, хуудсыг шинэчлэх
        setStoreName(tempName.trim());
        router.refresh();
        // Бараануудаа шууд татаж эхлэх
        fetchProducts();
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
        `/admin/api/productAllGet?storeName=${encodeURIComponent(storeName)}`,
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
 
  useEffect(() => {
    if (storeName) {
      fetchProducts();
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white transition-colors duration-300 px-4">
        <h1 className="text-3xl italic mb-8 text-center">
          Дэлгүүрийн нэрээ бүртгүүлнэ үү
        </h1>
 
        <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 w-full max-w-md shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-widest">
                Дэлгүүрийн нэр
              </label>
              <input
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-gray-500"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Жишээ: High-Tech Store"
              />
            </div>
 
            <button
              onClick={handleSetupStore}
              disabled={isSettingUp}
              className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black italic text-white dark:text-black">
            "{storeName}"
          </h1>
        </div>
        <ProductForm
          key={storeName}
          storeName={storeName}
          onSuccess={fetchProducts}
        />
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/10">
          <p className="opacity-70 text-sm font-bold uppercase tracking-wider">
            Нийт бараа
          </p>
          <h2 className="text-5xl font-black mt-2">{products.length}</h2>
        </div>
        <div className="p-8 rounded-3xl bg-indigo-600 border border-white/10 text-white">
          <p className="opacity-70 text-sm font-bold uppercase tracking-wider">
            Захиалга
          </p>
          <h2 className="text-5xl font-black mt-2">0</h2>
        </div>
      </div>
 
      <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10">
        <RevenueChart orders={[]} />
      </div>
    </div>
  );
}