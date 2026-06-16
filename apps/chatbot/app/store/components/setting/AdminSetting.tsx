"use client";

import React from "react";
import { UserProfile, useUser } from "@clerk/nextjs";
import { Loader2, ShieldCheck, Fingerprint } from "lucide-react";

export default function AdminSettings() {
  const { isLoaded } = useUser();

  if (!isLoaded)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
          System Loading...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12 animate-in fade-in duration-1000">
      <header className="space-y-4 border-b border-slate-200 dark:border-white/5 pb-6 md:pb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Fingerprint className="text-indigo-500" size={20} />
          </div>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em]">
            Identity Management
          </p>
        </div>
        {/* text-4xl sm:text-6xl md:text-8xl -> Утас дээр гарчиг хэтэрхий томдож дэлгэцнээс гарахгүй байхаар зассан */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
          Account<span className="text-indigo-500">Center.</span>
        </h1>
        <p className="text-slate-500 dark:text-gray-500 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium leading-relaxed">
          Хувийн мэдээлэл болон аюулгүй байдлын бүрэн тохиргоо
        </p>
      </header>

      {/* w-full overflow-x-auto -> Clerk-ийн компонент утасны дэлгэцийг хажуу тийш нь түлхэхээс хамгаална */}
      <div className="flex justify-center pb-12 md:pb-20 w-full overflow-x-auto no-scrollbar">
        <UserProfile
          appearance={{
            elements: {
              // rootBox-ийг max-w-full болгож утсанд тааруулав
              rootBox: "w-full max-w-full shadow-2xl",
              card: "bg-[#080808] border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] w-full",
              navbar:
                "bg-[#0A0A0A] border-r border-white/5 p-4 sm:p-6 rounded-l-[1.5rem] sm:rounded-l-[2.5rem]",
              navbarButton:
                "text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 rounded-xl transition-all",
              navbarButton__active: "text-indigo-500 bg-indigo-500/5",
              headerTitle:
                "text-white font-black uppercase italic tracking-tighter text-xl sm:text-2xl",
              headerSubtitle:
                "text-gray-500 text-xs font-medium uppercase tracking-widest",
              profileSectionTitleText:
                "text-indigo-400 font-black uppercase text-[11px] tracking-[0.2em] border-b border-white/5 pb-2 mb-4",
              userPreviewMainIdentifier: "text-white font-bold",
              userPreviewSecondaryIdentifier: "text-gray-500",
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-500 border-none text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
              formFieldInput:
                "bg-black border border-white/10 rounded-xl text-white focus:border-indigo-500 transition-all",
              formFieldLabel:
                "text-gray-400 font-bold uppercase text-[9px] tracking-widest",
              footerActionText: "text-gray-500 text-[10px]",
              footerActionLink:
                "text-indigo-500 hover:text-indigo-400 font-bold",
              badge:
                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase text-[9px] font-black tracking-widest",
              scrollBox:
                "rounded-r-[1.5rem] sm:rounded-r-[2.5rem] no-scrollbar",
              accordionTriggerButton: "hover:bg-white/5 text-white",
            },
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: "#080808",
            },
          }}
        />
      </div>

      {/* flex-col md:flex-row -> Утас дээр доошоо цуварч харагдана, text-center md:text-left */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/5 rounded-[1.5rem] sm:rounded-[2rem]">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl shrink-0">
            <ShieldCheck className="text-emerald-500" size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-slate-900 dark:text-white font-bold text-sm uppercase">
              End-to-End Encryption
            </p>
            <p className="text-[10px] text-slate-400 dark:text-gray-600 uppercase tracking-widest leading-relaxed">
              Таны мэдээлэл Clerk-ийн хамгаалалтын системээр хамгаалагдсан.
            </p>
          </div>
        </div>
        <div className="px-6 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full max-w-max">
          <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em] whitespace-nowrap">
            System Version 2.4.0-PRO
          </p>
        </div>
      </footer>
    </div>
  );
}
