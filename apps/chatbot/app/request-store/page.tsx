"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { SparklesCore } from "@/lib/utils/chat-animation/sparkles";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import RequestStoreForm from "./components/RequestStoreForm";

type StoreState = {
  hasStore: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
};

export default function RequestStorePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [state, setState] = useState<StoreState | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    fetch("/chat/api/store/request")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setState(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <SparklesCore
          id="tsparticles-request-store"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={30}
          className="w-full h-full"
        />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 py-16">
        <Link
          href="/"
          className="self-start mb-8 text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Нүүр хуудас руу буцах
        </Link>

        <span className="px-5 py-1.5 rounded-full border border-white/15 bg-white/5 text-[11px] font-bold tracking-[0.3em] uppercase text-slate-300 backdrop-blur-md">
          Худалдагч болох
        </span>

        <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-center">
          Дэлгүүрээ{" "}
          <span className="bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] bg-clip-text text-transparent italic">
            нээцгээе!
          </span>
        </h1>
        <p className="mt-3 max-w-md text-center text-slate-400 text-sm md:text-base">
          Доорх мэдээллийг бөглөж илгээснээр админ таны хүсэлтийг хянан
          баталгаажуулна.
        </p>

        <div className="mt-10 w-full max-w-lg">
          {!isLoaded ? null : isSignedIn ? (
            state?.hasStore ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center space-y-4 backdrop-blur-md">
                {state.status === "APPROVED" ? (
                  <>
                    <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
                    <h2 className="text-xl font-bold">
                      Таны дэлгүүр баталгаажсан!
                    </h2>
                    <p className="text-sm text-slate-400">
                      Та одоо бараагаа байршуулж зарах боломжтой.
                    </p>
                    <Link
                      href="/store"
                      className="inline-block rounded-xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] px-6 py-2.5 font-semibold text-white transition-all hover:opacity-90"
                    >
                      Дэлгүүр рүү очих
                    </Link>
                  </>
                ) : state.status === "REJECTED" ? (
                  <>
                    <XCircle className="mx-auto h-14 w-14 text-red-400" />
                    <h2 className="text-xl font-bold">Хүсэлт татгалзагдсан</h2>
                    <p className="text-sm text-slate-400">
                      Уучлаарай, таны хүсэлт батлагдсангүй. Дэлгэрэнгүй
                      мэдээллийг админтай холбогдож тодруулна уу.
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="mx-auto h-14 w-14 text-amber-400" />
                    <h2 className="text-xl font-bold">
                      Таны хүсэлт хянагдаж байна
                    </h2>
                    <p className="text-sm text-slate-400">
                      Админ таны хүсэлт болон бичиг баримтыг шалгаж байна. Түр
                      хүлээнэ үү — баталгаажсаны дараа танд мэдэгдэнэ.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <RequestStoreForm />
            )
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center space-y-4">
              <p className="text-slate-300">
                Дэлгүүр нээхийн тулд эхлээд нэвтэрнэ үү
              </p>
              <SignInButton mode="redirect">
                <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9f8cff] via-[#7c5cff] to-[#56a8ff] text-white font-semibold hover:opacity-90 transition-all">
                  Нэвтрэх
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
