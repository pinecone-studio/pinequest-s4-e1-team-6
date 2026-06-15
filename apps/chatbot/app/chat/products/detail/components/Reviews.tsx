"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: number;
};

const STORAGE_PREFIX = "product-reviews:";

function loadReviews(productId: string): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + productId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReviews(productId: string, reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + productId, JSON.stringify(reviews));
  } catch {}
}

function StarRow({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => onChange && setHover(n)}
            onMouseLeave={() => onChange && setHover(0)}
            className={onChange ? "transition-transform hover:scale-110" : "cursor-default"}
            aria-label={`${n} од`}
          >
            <Star
              size={size}
              className={
                filled ? "fill-[#ffc24b] text-[#ffc24b]" : "text-slate-600"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export function Reviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (productId) setReviews(loadReviews(productId));
  }, [productId]);

  const avg = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  const submit = () => {
    if (rating === 0 || !comment.trim()) return;
    const review: Review = {
      id: `${productId}-${reviews.length}-${comment.length}-${rating}`,
      author: author.trim() || "Зочин",
      rating,
      comment: comment.trim(),
      createdAt: Date.parse(new Date().toISOString()),
    };
    const next = [review, ...reviews];
    setReviews(next);
    saveReviews(productId, next);
    setRating(0);
    setComment("");
    setAuthor("");
  };

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#b7a6ff] font-bold uppercase text-[10px] tracking-widest">
          Үнэлгээ ба сэтгэгдэл
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRow value={Math.round(avg)} size={14} />
            <span className="text-xs font-bold text-slate-200">
              {avg.toFixed(1)}{" "}
              <span className="font-normal text-slate-500">
                ({reviews.length})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Бичих хэсэг */}
      <div className="space-y-3 rounded-xl bg-black/20 p-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-300">Таны үнэлгээ:</span>
          <StarRow value={rating} onChange={setRating} size={20} />
        </div>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Таны нэр (заавал биш)"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#9f8cff]/60"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Энэ бараагаар сэтгэгдлээ үлдээнэ үү…"
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#9f8cff]/60"
        />
        <button
          onClick={submit}
          disabled={rating === 0 || !comment.trim()}
          className="w-full rounded-xl bg-gradient-to-br from-[#9f8cff] to-[#6f7bff] py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Сэтгэгдэл нийтлэх
        </button>
      </div>

      {/* Сэтгэгдлийн жагсаалт */}
      {reviews.length === 0 ? (
        <p className="py-2 text-center text-xs text-slate-500">
          Одоогоор сэтгэгдэл алга. Хамгийн түрүүнд үнэлгээ өгөөрэй!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{r.author}</span>
                <StarRow value={r.rating} size={13} />
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
