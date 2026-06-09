"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import type { FeaturePreset, FeatureProduct } from "../feature-presets";

type FeatureExplorerClientProps = {
  preset: FeaturePreset;
  products: FeatureProduct[];
};

function ProductCard({
  product,
  index,
}: {
  product: FeatureProduct;
  index: number;
}) {
  return (
    <article
      className="group overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/8 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-none"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black/10">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full border border-white/12 bg-black/25 px-3 py-1 text-[10px] font-black tracking-[0.22em] uppercase text-white/80">
          {product.category || "Feature"}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/55">
            {product.storeName}
          </p>
          <h3 className="line-clamp-2 text-lg font-black leading-tight text-white">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-white/70">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-black text-[#d8d1ff]">
            {product.price}
          </p>
          <button className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
            Захиалах
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FeatureExplorerClient({
  preset,
  products,
}: FeatureExplorerClientProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#7d82ff] text-white dark:bg-[#0B1020]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-white/10 blur-3xl dark:bg-[#6c7bff]/10" />
        <div className="absolute top-10 right-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[#a7b7ff]/18 blur-3xl dark:bg-[#4aa3ff]/8" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,#9ca6ff_0%,#8890f0_30%,#7d82ff_62%,#93baf3_100%)] opacity-90 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_34%),linear-gradient(135deg,#111827_0%,#1f2a60_38%,#0f172a_100%)] dark:opacity-100" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 md:px-6 md:py-6">
        <header className="mb-5 flex items-center justify-between rounded-3xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-md shadow-lg shadow-black/6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold tracking-[0.25em] uppercase md:flex">
            <Sparkles className="h-4 w-4" />
            {preset.badge}
          </div>

          <button
            onClick={() =>
              router.push(`/?prompt=${encodeURIComponent(preset.prompt)}`)
            }
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-900"
          >
            <Wand2 className="h-4 w-4" />
            Энэ vibe-ээр чатла
          </button>
        </header>

        <main className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/12 bg-white/8 p-6 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:p-8">
            <div
              className={`mb-4 inline-flex rounded-full bg-gradient-to-r ${preset.accent} px-4 py-2 text-xs font-black tracking-[0.3em] uppercase text-white`}
            >
              {preset.title}
            </div>
            <h1 className="max-w-2xl text-4xl font-black tracking-tight md:text-6xl">
              {preset.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              {preset.heroDescription}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-[10px] font-black tracking-[0.25em] text-white/60 uppercase">
                  Prompt
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  {preset.prompt}
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-[10px] font-black tracking-[0.25em] text-white/60 uppercase">
                  Result
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  Сонгосон тэмдэгт дээр яг тохирох бараануудыг нэг дор,
                  цэгцтэй grid хэлбэрээр харуулна.
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-[10px] font-black tracking-[0.25em] text-white/60 uppercase">
                  Mode
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  {preset.strategy === "top"
                    ? "Trending"
                    : preset.strategy === "random"
                      ? "Random"
                      : preset.strategy === "diverse"
                        ? "Curated mix"
                        : "Rare picks"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
                  Featured picks
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {products.length} бараа
                </p>
              </div>
              <Link
                href="/"
                className="text-xs font-semibold text-white/70 underline-offset-4"
              >
                Back to home
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.slice(0, 6).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center text-sm text-white/75">
                Энэ vibe-д яг таарах бараа олдсонгүй. Доорх кнопоор чат руу буцаад
                өөр prompt туршаарай.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
