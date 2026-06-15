/**
 * Худалдагчийн итгэлцлийн түвшин (trust-tier) — амжилттай хүргэгдсэн захиалгын
 * тоонд тулгуурлан тухайн дэлгүүр хэдэн бараа байршуулж болохыг тодорхойлно.
 *
 * Дүрэм:
 *   0 амжилттай захиалга   -> 5 бараа
 *   5+ амжилттай захиалга   -> 20 бараа
 *   20+ амжилттай захиалга  -> хязгааргүй
 */

export const DELIVERED_STATUSES = ["DELIVERED", "COMPLETED"] as const;

export function productLimitFor(deliveredCount: number): number {
  if (deliveredCount >= 20) return Infinity;
  if (deliveredCount >= 5) return 20;
  return 5;
}

/** Дараагийн түвшинд хүрэхэд хэдэн амжилттай захиалга дутаж байгаа */
export function ordersToNextTier(deliveredCount: number): number | null {
  if (deliveredCount >= 20) return null;
  if (deliveredCount >= 5) return 20 - deliveredCount;
  return 5 - deliveredCount;
}

export function tierLabel(deliveredCount: number): string {
  const limit = productLimitFor(deliveredCount);
  return limit === Infinity ? "Хязгааргүй" : `${limit} бараа`;
}
