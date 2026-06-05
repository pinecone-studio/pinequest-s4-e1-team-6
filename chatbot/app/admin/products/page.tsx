"use client";

import { useState } from "react";
import ProductForm from "../components/product/ProductForm";
import ProductTable from "../components/product/ProductTable";
import { useAppStore } from "../store/useStore";

export default function ProductsPage() {
  const storeName = useAppStore((state) => state.storeName);
  const isLoading = useAppStore((state) => state.isLoading);
  const [search, setSearch] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) return <div className="text-white p-10">Ачаалж байна...</div>;

  if (!storeName)
    return (
      <div className="text-white p-10 italic">
        Дэлгүүр бүртгэлгүй байна. Та Dashboard дээр бүртгүүлнэ үү.
      </div>
    );

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white dark:text-black italic">
          {storeName}
        </h1>
        <ProductForm storeName={storeName} onSuccess={handleSuccess} />
      </div>

      <div className="bg-white/5 rounded-[2.5rem] border border-white/10 dark:border-gray-300 dark:bg-[#1F2937] p-6">
        <h2 className="text-xl font-bold text-white mb-4 italic">
          Барааны жагсаалт
        </h2>

        <ProductTable key={refreshKey} storeName={storeName} search={search} />
      </div>
    </div>
  );
}
