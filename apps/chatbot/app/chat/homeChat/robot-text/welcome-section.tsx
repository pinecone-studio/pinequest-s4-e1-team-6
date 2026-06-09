"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FEATURE_PRESETS,
  type FeatureSlug,
} from "@/app/chat/explore/feature-presets";

function PerspectiveMagneticCard({
  title,
  badge,
  prompt,
  accent,
  onClick,
  index,
}: {
  title: string;
  badge: string;
  prompt: string;
  accent: string;
  onClick: () => void;
  index: number;
}) {
  return (
    <div className="w-full">
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="relative flex h-[124px] w-full flex-col items-start rounded-2xl border border-white/15 bg-white/12 p-4 backdrop-blur-2xl transition-none"
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
        <div className="relative z-10 flex h-full w-full flex-col justify-between text-left pointer-events-none">
          <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-black tracking-[0.25em] text-white/75 uppercase">
            {badge}
          </span>
          <div>
            <p className="text-[9px] font-black tracking-widest text-white/60 uppercase mb-0.5">
              Feature
            </p>
            <p className="text-sm font-bold text-white/90 line-clamp-2">
              {title}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-white/60 line-clamp-2">
              {prompt}
            </p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

export function WelcomeSection({
  onSelect,
  onOpenFeature,
  userName,
}: {
  onSelect: (q: string) => void;
  onOpenFeature?: (slug: FeatureSlug) => void;
  userName?: string | null;
}) {
  const firstName = userName ? userName.split(" ")[0] : "Зочин";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] md:min-h-[85vh] overflow-hidden px-6 pb-38">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 md:mb-8 px-3 py-1 rounded-full border border-white/20 bg-white/15 backdrop-blur-sm shadow-sm"
        >
          <span className="text-white text-[7px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase">
            AI Lifestyle Curated
          </span>
        </motion.div>

        <h1 className="text-3xl md:text-7xl font-black tracking-tighter text-center leading-tight md:leading-[1.1] mb-6 md:mb-6 ">
          <span className="text-white">Сайн уу, </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#d7e7ff] to-white animate-shimmer bg-[length:200%_auto] pr-4 italic">
            {firstName}!
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-x-1.5 text-xs md:text-lg font-light text-white/80 text-center mb-8 md:mb-16 max-w-none md:max-w-max mx-auto whitespace-nowrap"
        >
          <span>Таны сонирхолд нийцсэн</span>
          <span className="text-white italic font-bold">
            шилдэг бүтээгдэхүүнүүдийг AI туслах
          </span>
          <span>тань санал болгож байна.</span>
        </motion.p>

        <div className="hidden md:grid grid-cols-4 gap-4 w-full max-w-4xl px-2 mt-15">
          {FEATURE_PRESETS.map((item, i) => (
            <PerspectiveMagneticCard
              key={i}
              title={item.heroTitle}
              badge={item.title}
              prompt={item.heroDescription}
              accent={item.accent}
              onClick={() => {
                if (onOpenFeature) {
                  onOpenFeature(item.slug);
                  return;
                }
                onSelect(item.prompt);
              }}
              index={i}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-shimmer {
          animation: shimmer 5s linear infinite;
        }
      `}</style>
    </div>
  );
}
