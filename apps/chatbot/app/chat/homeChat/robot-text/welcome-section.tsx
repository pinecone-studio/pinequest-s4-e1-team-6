"use client";
import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  {
    title: "Санал болгож буй зүйл",
    description: "Сүүлд хайсан зүйлс дээр тулгуурлаад надад таарах бараануудыг шууд гаргаж ир.",
    icon: Lightbulb,
  },
  {
    title: "Харьцуулах",
    description: "2 барааг хайж сонгоод үнэ, стиль, материал, давуу талыг нь харьцуул.",
    icon: Scale,
  },
] as const;

type VisualSearchUserMessage = {
  role: "USER";
  content: string;
  imagePreview: string;
};

type VisualSearchProduct = {
  id?: string;
  name?: string;
  price?: string | number;
  image?: string;
  description?: string;
  store_id?: string;
};

function QuickActionCard({
  title,
  icon: Icon,
  onClick,
  index,
  isUploading = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  index: number;
  isUploading?: boolean;
}) {
  return (
    <div className="w-full">
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="relative flex h-[74px] w-full items-center rounded-[18px] border border-white/16 bg-white/10 px-4 text-left backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_28px_rgba(8,15,40,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/14 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_34px_rgba(8,15,40,0.22)] active:translate-y-0 active:scale-[0.99] md:h-[92px] md:rounded-[22px] md:px-5"
      >
        <div className="pointer-events-none relative z-10 flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 text-white dark:text-white/92">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/14 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] md:h-10 md:w-10">
              <Icon className="h-4.5 w-4.5 shrink-0 md:h-5 md:w-5" />
            </span>
            <span className="truncate text-[14px] font-bold tracking-[-0.01em] md:text-[16px]">
              {title}
            </span>
          </div>
          <span className="shrink-0 text-lg font-semibold text-white/62 md:text-xl">
            +
          </span>
        </div>
        {isUploading && (
          <span className="absolute right-3 top-3 text-[9px] font-semibold text-white/80 md:right-4 md:top-4 md:text-[11px]">
            Uploading...
          </span>
        )}
      </motion.button>
    </div>
  );
}

export function WelcomeSection({
  onSelect,
  onVisualResult,
  userName,
  recentInterestPrompts = [],
  children,
}: {
  onSelect: (q: string) => void;
  onVisualResult: (
    userMsg: VisualSearchUserMessage,
    products: VisualSearchProduct[],
  ) => void;
  userName?: string | null;
  recentInterestPrompts?: string[];
  children?: React.ReactNode;
}) {
  const firstName = userName ? userName.split(" ")[0] : "Зочин";
  const router = useRouter();

  const recommendationPrompt =
    recentInterestPrompts.length > 0
      ? `Миний сүүлд сонирхсон болон хайж байсан зүйлс: ${recentInterestPrompts.join(" | ")}. Эдгээрээс санаа аваад яг надад тохирох 6 бүтээгдэхүүнийг богино тайлбартай шууд санал болго.`
      : "Миний сонирхолд нийцэх магадлалтай 6 бүтээгдэхүүнийг төрөл бүрээс нь сонгоод шууд санал болго.";

  return (
    <div className="relative flex min-h-0 w-full flex-col items-center justify-center overflow-hidden px-3 pb-8 pt-4 md:min-h-[85vh] md:px-6 md:pb-38 md:pt-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-center leading-tight md:leading-[1.1] mb-3 md:mb-6">
          <span className="text-white">Сайн уу, </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#d7e7ff] to-white animate-shimmer bg-[length:200%_auto] pr-2 italic">
            {firstName}!
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-y-1 sm:gap-x-1.5 text-[13px] md:text-lg font-light text-white/80 text-center mb-6 md:mb-16 max-w-[34ch] sm:max-w-none mx-auto"
        >
          <span>Таны сонирхолд нийцсэн</span>
          <span className="text-white italic font-bold">
            шилдэг бүтээгдэхүүнүүдийг AI туслах
          </span>
          <span>тань санал болгож байна.</span>
        </motion.p>

        {children ? (
          <div className="relative z-20 mt-1 w-full max-w-[52rem] md:mt-0">
            {children}
          </div>
        ) : null}

        <div className="mt-4 grid w-full max-w-5xl grid-cols-1 gap-2.5 px-0.5 sm:grid-cols-2 md:mt-10 md:grid-cols-2 md:gap-4 md:px-2">
          {QUICK_ACTIONS.map((item, i) => (
            <div key={item.title}>
              <QuickActionCard
                title={item.title}
                icon={item.icon}
                onClick={() => {
                  if (item.title === "Санал болгож буй зүйл") {
                    onSelect(recommendationPrompt);
                    return;
                  }
                  if (item.title === "Харьцуулах") {
                    router.push("/chat/compare");
                    return;
                  }
                }}
                index={i}
              />
            </div>
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