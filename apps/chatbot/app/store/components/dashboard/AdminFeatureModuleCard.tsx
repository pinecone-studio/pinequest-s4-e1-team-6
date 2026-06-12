"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import type { AdminFeature } from "../../lib/adminFeatures";

interface AdminFeatureModuleCardProps {
  feature: AdminFeature;
}

export default function AdminFeatureModuleCard({
  feature,
}: AdminFeatureModuleCardProps) {
  const Icon = feature.icon;

  const cardContent = (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-black mb-1.5 sm:mb-2">
            {feature.category}
          </p>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-400 transition-colors truncate sm:whitespace-normal">
            {feature.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-500 mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-none">
            {feature.description}
          </p>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all shrink-0">
          <Icon className="text-indigo-400" size={18} />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
        {feature.isAvailable ? (
          <>
            Open <ChevronRight size={13} />
          </>
        ) : (
          <>
            Coming Soon <Lock size={13} />
          </>
        )}
      </div>
    </div>
  );

  const className =
    "group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 bg-[#0A0A0A] p-4 sm:p-6 transition-all";

  if (feature.isAvailable) {
    return (
      <Link
        href={`/store/modules/${feature.slug}`}
        className={`${className} hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-indigo-500/30`}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={`${className} cursor-not-allowed opacity-75`}
      aria-disabled="true"
      title="Энэ модуль одоогоор бэлэн болоогүй байна"
    >
      {cardContent}
    </div>
  );
}
