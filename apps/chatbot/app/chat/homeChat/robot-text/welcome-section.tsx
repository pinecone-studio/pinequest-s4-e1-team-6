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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className="relative flex h-[128px] w-full flex-col items-start justify-between rounded-[22px] border border-white/14 bg-white/8 p-5 text-left backdrop-blur-xl transition-all duration-200 hover:bg-white/12"
      >
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col justify-between">
          <div className="flex items-center gap-2 text-white dark:text-white/92">
            <Icon className="h-4.5 w-4.5" />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">
              {title}
            </span>
          </div>
          <p className="max-w-[28ch] text-[15px] leading-6 text-white dark:text-white/72">
            {description}
          </p>
        </div>
        {isUploading && (
          <span className="absolute right-4 top-4 text-[11px] font-semibold text-white/80">
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
    <div className="relative flex min-h-[68vh] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-6 md:min-h-[85vh] md:px-6 md:pb-38">
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
          className="flex items-center justify-center gap-x-1.5 text-xs md:text-lg font-light text-white/80 text-center mb-10 md:mb-16 max-w-none md:max-w-max mx-auto md:whitespace-nowrap md:flex-row flex-col"
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
          <div className="relative z-20 mt-2 w-full max-w-4xl md:mt-0">
            {children}
          </div>
        ) : null}

        <div className="mt-6 grid w-full max-w-5xl grid-cols-1 gap-3 px-1 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-4 md:px-2">
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
          <div className="pointer-events-none absolute inset-0 z-20 rounded-[32px] border border-dashed border-white/30 bg-white/10 backdrop-blur-sm" />
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
