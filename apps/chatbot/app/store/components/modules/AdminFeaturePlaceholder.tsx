import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import type { AdminFeature } from "../../lib/adminFeatures";

interface AdminFeaturePlaceholderProps {
  feature: AdminFeature;
}

export default function AdminFeaturePlaceholder({
  feature,
}: AdminFeaturePlaceholderProps) {
  const Icon = feature.icon;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-0 space-y-6 sm:space-y-8">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Dashboard руу буцах
      </Link>

      <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] p-5 sm:p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-start gap-5 sm:gap-6">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
            <Icon className="text-indigo-400" size={22} />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400">
                {feature.category}
              </p>
              <h1 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {feature.title}
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-amber-300">
              <Clock3 size={14} />
              Энэ модуль одоогоор боловсруулагдаж байна
            </div>

            <p className="max-w-2xl text-xs sm:text-sm leading-6 text-slate-500 dark:text-gray-500">
              Route нь одоо ажиллана, гэхдээ энэ feature-ийн бодит business
              logic хараахан хийгдээгүй байна. Иймээс 404 өгөхгүйгээр түр
              мэдээллийн дэлгэц үзүүлж байна.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
