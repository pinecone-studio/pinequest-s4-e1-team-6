"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, PackageOpen, Trash2, Edit3, ImageOff } from "lucide-react";
import ProductForm from "./ProductForm";

export default function ProductTable({
  search = "",
  storeName,
}: {
  search?: string;
  storeName: string;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!storeName) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/store/api/productAllGet?storeName=${encodeURIComponent(storeName)}&t=${Date.now()}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        console.error(`Серверийн алдаа: ${res.status}`);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/store/api/productDelete?id=${deletingId}&storeName=${encodeURIComponent(storeName)}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingId));
        setDeletingId(null);
      } else {
        alert("Устгахад алдаа гарлаа: " + data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getProductImage = (p: any): string => {
    const meta = p.metadata || p;

    return (
      meta.product_image_url ||
      meta.imageUrl ||
      meta.image ||
      "https://placehold.co/400x400?text=No+Image"
    );
  };

  const getSizeStockRows = (p: any) => {
    const meta = p.metadata || p;
    const raw = meta.sizeStock || meta.size_stock;
    if (!raw) return [];

    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed)
        ? parsed.filter((item) => item?.size && Number(item?.stock) > 0)
        : [];
    } catch {
      return [];
    }
  };

  const filtered = products.filter((p) => {
    const meta = p.metadata || {};
    const name = meta.name || p.name || "";
    return name.toLowerCase().includes((search || "").toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-slate-500 dark:text-gray-400 text-sm animate-pulse font-medium">
          Бараануудыг ачаалж байна...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white dark:bg-gray-900 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
      {editingProduct && (
        <ProductForm
          storeName={storeName}
          initialData={editingProduct}
          onSuccess={() => {
            setEditingProduct(null);
            fetchData();
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Устгахдаа итгэлтэй байна уу?
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-center text-xs mb-6 leading-relaxed">
              Сонгосон барааг системээс бүрмөсөн устгах болно.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 dark:text-gray-400 hover:bg-white/5 transition-all text-sm"
              >
                Болих
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Устгах"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* overflow-x-auto-г утас дээр блок бүтэц рүү шилжүүлэх тул хасаж, уян хатан болгов */}
      <div className="w-full">
        <table className="w-full text-sm text-left block md:table">
          <thead className="hidden md:table-header-group">
            <tr className="bg-gray-50/50 dark:bg-white/2 text-slate-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5 uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-5">Зураг</th>
              <th className="px-6 py-5">Барааны мэдээлэл</th>
              <th className="px-6 py-5">Үнэ</th>
              <th className="px-6 py-5">Брэнд</th>
              <th className="px-6 py-5">Үлдэгдэл</th>
              <th className="px-6 py-5 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5 block md:table-row-group p-4 md:p-0 space-y-4 md:space-y-0">
            {filtered.length === 0 ? (
              <tr className="block md:table-row">
                <td
                  colSpan={6}
                  className="p-10 sm:p-20 text-center text-slate-500 dark:text-gray-400 block md:table-cell"
                >
                  <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">
                    Одоогоор бараа бүртгэгдээгүй байна.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const meta = p.metadata || {};
                const name = meta.name || p.name || "Нэргүй бараа";
                const price = meta.price || p.price || 0;
                const brand = meta.brand || p.brand || "Тодорхойгүй";
                const stock = meta.stock || p.stock || 0;
                const sizeRows = getSizeStockRows(p);

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors group block md:table-row border border-gray-100 dark:border-white/5 md:border-none rounded-2xl p-4 md:p-0 bg-slate-50/30 md:bg-transparent"
                  >
                    {/* Гар утас дээр Card хэлбэрээр зэрэгцүүлэх grid бүтэц */}
                    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] md:contents gap-4 md:gap-0">
                      {/* Зураг */}
                      <td className="md:px-6 md:py-4 flex md:table-cell justify-center sm:justify-start">
                        <div className="w-20 h-20 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/5 shadow-inner">
                          <img
                            src={getProductImage(p)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={name}
                            onError={(e: any) =>
                              (e.target.src =
                                "https://placehold.co/400x400?text=Error")
                            }
                          />
                        </div>
                      </td>

                      {/* Барааны мэдээлэл, үнэ, брэнд, үлдэгдлийг утас дээр нэг дор харуулах блок */}
                      <div className="space-y-3 sm:space-y-2 md:contents">
                        {/* Нэр ба Категори */}
                        <td className="md:px-6 md:py-4 block md:table-cell">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-sm">
                            {name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase mt-0.5">
                            {meta.category || "Ерөнхий"}
                          </p>
                        </td>

                        {/* Үнэ */}
                        <td className="md:px-6 md:py-4 flex items-center md:table-cell">
                          <span className="md:hidden text-xs font-medium text-slate-400 mr-2 uppercase tracking-wider text-[10px]">
                            Үнэ:
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-sm md:text-base">
                            {new Intl.NumberFormat().format(price)}₮
                          </span>
                        </td>

                        {/* Брэнд */}
                        <td className="md:px-6 md:py-4 flex items-center md:table-cell text-slate-500 dark:text-gray-500 font-medium text-xs md:text-sm">
                          <span className="md:hidden text-xs font-medium text-slate-400 mr-2 uppercase tracking-wider text-[10px]">
                            Брэнд:
                          </span>
                          {brand}
                        </td>

                        {/* Үлдэгдэл ба Размерууд */}
                        <td className="md:px-6 md:py-4 block md:table-cell">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="md:hidden text-xs font-medium text-slate-400 mr-2 uppercase tracking-wider text-[10px]">
                                Үлдэгдэл:
                              </span>
                              <div
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                  stock > 0
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                                }`}
                              >
                                {stock > 0 ? `${stock} ширхэг` : "⚠️ Дууссан"}
                              </div>
                            </div>

                            {stock === 0 && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 max-w-max">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] text-rose-400 font-bold">
                                  Нөөц дууссан
                                </span>
                              </div>
                            )}

                            {sizeRows.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 max-w-full md:max-w-52">
                                {sizeRows.map((item: any) => (
                                  <span
                                    key={item.size}
                                    className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                      Number(item.stock) > 0
                                        ? "bg-gray-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 dark:text-gray-300"
                                        : "bg-rose-500/10 text-rose-400 line-through"
                                    }`}
                                  >
                                    {item.size}: {item.stock}ш
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Үйлдэл (Засах, Устгах товчлуурууд) */}
                        <td className="md:px-6 md:py-4 block md:table-cell border-t border-gray-100 dark:border-white/5 md:border-none pt-2 md:pt-0">
                          <div className="flex items-center justify-end gap-2 md:gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform md:translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-2 sm:p-2.5 hover:bg-indigo-500/10 text-indigo-400 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                              title="Засах"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span className="md:hidden">Засах</span>
                            </button>
                            <button
                              onClick={() => setDeletingId(p.id)}
                              className="p-2 sm:p-2.5 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                              title="Устгах"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="md:hidden">Устгах</span>
                            </button>
                          </div>
                        </td>
                      </div>
                    </div>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
