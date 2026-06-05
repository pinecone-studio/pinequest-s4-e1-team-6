"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const suggestions = [
  {
    label: "Шинэ коллекц",
    query: "Шинэ пүүз харуулаач",
    emoji: "👟",
    desc: "Latest Drops",
  },
  {
    label: "Өв соёл",
    query: "Үндэсний хувцас харъя",
    emoji: "👗",
    desc: "Heritage Style",
  },
  {
    label: "Self Care",
    query: "Шилдэг косметик",
    emoji: "💄",
    desc: "Beauty Essentials",
  },
  {
    label: "Трэндүүд",
    query: "Trending одоо юу байна?",
    emoji: "🚀",
    desc: "What's Hot",
  },
];

function PerspectiveMagneticCard({
  label,
  emoji,
  desc,
  onClick,
  index,
}: {
  label: string;
  emoji: string;
  desc: string;
  onClick: () => void;
  index: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 80, damping: 20 });
  const springY = useSpring(y, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-100, 100], [12, -12]);
  const rotateY = useTransform(springX, [-100, 100], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  return (
    <div style={{ perspective: "1000px" }} className="w-full">
      <motion.button
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        style={{
          x: springX,
          y: springY,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group relative flex flex-col items-start p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-[#077eef]/10 hover:border-[#077eef]/60 dark:hover:border-[#077eef]/50 hover:shadow-[0_20px_40px_rgba(7,126,239,0.1)] transition-all duration-300 w-full h-[110px]"
      >
        <div
          className="relative z-10 flex flex-col h-full justify-between w-full text-left pointer-events-none"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-500 origin-left">
            {emoji}
          </span>
          <div>
            <p className="text-[9px] font-black tracking-widest text-[#077eef]/60 uppercase mb-0.5">
              {desc}
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white/90 group-hover:text-[#077eef] transition-colors line-clamp-1">
              {label}
            </p>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

export function WelcomeSection({
  onSelect,
  userName,
}: {
  onSelect: (q: string) => void;
  userName?: string | null;
}) {
  const firstName = userName ? userName.split(" ")[0] : "Зочин";

  const handleSuggestionClick = (query: string) => {
    onSelect(query);
    setTimeout(() => {
      const chatInput = document.querySelector(
        'input[type="text"]',
      ) as HTMLInputElement;
      const chatForm = document.querySelector("form");
      if (chatInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(chatInput, query);
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        if (chatForm) chatForm.requestSubmit();
      }
    }, 50);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] md:min-h-[85vh] overflow-hidden px-6 pb-38">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(7,126,239,0.05),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 md:mb-8 px-3 py-1 rounded-full border border-[#077eef]/20 bg-[#077eef]/5 backdrop-blur-sm"
        >
          <span className="text-[#077eef] text-[7px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase">
            AI Lifestyle Curated
          </span>
        </motion.div>

        <h1 className="text-3xl md:text-7xl font-black tracking-tighter text-center leading-tight md:leading-[1.1] mb-4 md:mb-6">
          <span className="text-slate-900 dark:text-white">Сайн уу, </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#077eef] via-cyan-400 to-[#077eef] animate-shimmer bg-[length:200%_auto] italic">
            {firstName}!
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-1.5 text-xs md:text-lg font-light text-slate-500 dark:text-slate-400 text-center mb-8 md:mb-16 max-w-[280px] md:max-w-lg mx-auto"
        >
          <span>Таны</span>
          <span className="text-[#077eef] italic font-bold">үнэ цэнийг</span>
          <span>төгс илэрхийлэх шийдэл энд бий.</span>
        </motion.p>

        <div className="hidden md:grid grid-cols-4 gap-4 w-full max-w-4xl px-2 mt-15">
          {suggestions.map((item, i) => (
            <PerspectiveMagneticCard
              key={i}
              {...item}
              onClick={() => handleSuggestionClick(item.query)}
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
