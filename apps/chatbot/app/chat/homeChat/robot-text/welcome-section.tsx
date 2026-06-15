"use client";
import React from "react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Lightbulb, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVisualSearch } from "@/app/chat/hooks/useVisualSearch";

const QUICK_ACTIONS = [
  {
    title: "Recommendations",
    description: "Сүүлд хайсан зүйлс дээр тулгуурлаад надад таарах бараануудыг шууд гаргаж ир.",
    icon: Lightbulb,
  },
  {
    title: "Comparison",
    description: "2 барааг хайж сонгоод үнэ, стиль, материал, давуу талыг нь харьцуул.",
    icon: Scale,
  },
  {
    title: "Image search",
    description: "Зураг оруулаад түүнтэй төстэй бараануудыг шууд гаргаж ир.",
    icon: Camera,
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
  description,
  icon: Icon,
  onClick,
  index,
  isUploading = false,
}: {
  title: string;
  description: string;
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
        className="relative flex h-auto min-h-[96px] w-full flex-col items-start justify-between rounded-[18px] border border-white/14 bg-white/8 p-3.5 text-left backdrop-blur-xl transition-all duration-200 hover:bg-white/12 md:h-[128px] md:rounded-[22px] md:p-5"
      >
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between gap-2 md:gap-0">
          <div className="flex items-center gap-2 text-white dark:text-white/92">
            <Icon className="h-4 w-4 md:h-4.5 md:w-4.5 shrink-0" />
            <span className="text-[13px] font-bold tracking-[-0.01em] md:text-[15px]">
              {title}
            </span>
          </div>
          <p className="w-full text-[12px] leading-snug text-white/90 dark:text-white/72 md:max-w-[28ch] md:text-[14px] md:leading-6">
            {description}
          </p>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { searchByImage, isSearching } = useVisualSearch();
  const [isDragging, setIsDragging] = useState(false);

  const recommendationPrompt =
    recentInterestPrompts.length > 0
      ? `Миний сүүлд сонирхсон болон хайж байсан зүйлс: ${recentInterestPrompts.join(" | ")}. Эдгээрээс санаа аваад яг надад тохирох 6 бүтээгдэхүүнийг богино тайлбартай шууд санал болго.`
      : "Миний сонирхолд нийцэх магадлалтай 6 бүтээгдэхүүнийг төрөл бүрээс нь сонгоод шууд санал болго.";

  const handleImageFile = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

    const userMsg: VisualSearchUserMessage = {
      role: "USER",
      content: "Зургаар хайж байна...",
      imagePreview: base64,
    };
    const result = await searchByImage(file);
    onVisualResult(userMsg, result.products || []);
  };

  return (
    <div className="relative flex min-h-0 w-full flex-col items-center justify-center overflow-hidden px-3 pb-8 pt-4 md:min-h-[85vh] md:px-6 md:pb-38 md:pt-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-3 md:mb-8 px-2.5 py-0.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-sm shadow-sm"
        >
          <span className="text-white text-[8px] md:text-[9px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">
            AI Lifestyle Curated
          </span>
        </motion.div>

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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageFile(file);
            e.currentTarget.value = "";
          }}
        />

        {children ? (
          <div className="relative z-20 mt-1 w-full max-w-[52rem] md:mt-0">
            {children}
          </div>
        ) : null}

        {/* Гар утас дээр 1 баганаар, таблет дээр 2, вэб дээр 3 баганаар маш гоё цэгцтэй харагдана */}
        <div className="mt-4 grid w-full max-w-5xl grid-cols-1 gap-2.5 px-0.5 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-4 md:px-2">
          {QUICK_ACTIONS.map((item, i) => {
            const isImageCard = item.title === "Image search";
            return (
              <div
                key={item.title}
                onDragOver={
                  isImageCard
                    ? (e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }
                    : undefined
                }
                onDragLeave={
                  isImageCard
                    ? () => {
                        setIsDragging(false);
                      }
                    : undefined
                }
                onDrop={
                  isImageCard
                    ? (e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) void handleImageFile(file);
                      }
                    : undefined
                }
              >
                <QuickActionCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  isUploading={isImageCard && isSearching}
                  onClick={() => {
                    if (item.title === "Recommendations") {
                      onSelect(recommendationPrompt);
                      return;
                    }

                    if (item.title === "Comparison") {
                      router.push("/chat/compare");
                      return;
                    }

                    fileInputRef.current?.click();
                  }}
                  index={i}
                />
              </div>
            );
          })}
        </div>

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-20 rounded-[24px] md:rounded-[32px] border border-dashed border-white/30 bg-white/10 backdrop-blur-sm" />
        )}
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