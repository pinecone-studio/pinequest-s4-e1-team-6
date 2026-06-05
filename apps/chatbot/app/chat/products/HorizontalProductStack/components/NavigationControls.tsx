"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationProps {
  onPrev: () => void;
  onNext: () => void;
  total: number;
  current: number;
}

export const NavigationControls = ({ onPrev, onNext, total = 0, current }: NavigationProps) => (
  <>
    <div className="absolute left-2 md:left-6 z-50">
      <button
        onClick={onPrev}
        className="p-3 md:p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white/60 hover:text-[#C5A059] hover:border-[#C5A059]/50 active:scale-90 transition-all shadow-2xl"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
      </button>
    </div>

    <div className="absolute right-2 md:right-6 z-50">
      <button
        onClick={onNext}
        className="p-3 md:p-5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white/60 hover:text-[#C5A059] hover:border-[#C5A059]/50 active:scale-90 transition-all shadow-2xl"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
      </button>
    </div>

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/5">
      {total > 0 && Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 transition-all duration-500 rounded-full ${
            i === current ? "w-8 bg-[#C5A059]" : "w-1.5 bg-white/20"
          }`}
        />
      ))}
    </div>
  </>
);