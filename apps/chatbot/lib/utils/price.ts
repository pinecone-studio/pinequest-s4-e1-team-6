export function parsePrice(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const normalized = raw.replace(/[^\d.,-]/g, "");
  if (!normalized || normalized === "-") return 0;

  const separators = normalized.match(/[.,]/g) || [];
  if (separators.length > 1) {
    return Number(normalized.replace(/[.,]/g, "")) || 0;
  }

  if (separators.length === 1) {
    const separator = separators[0];
    const separatorIndex = normalized.lastIndexOf(separator);
    const digitsAfter = normalized.slice(separatorIndex + 1).replace(/\D/g, "");
    const digitsBefore = normalized.slice(0, separatorIndex).replace(/\D/g, "");

    if (digitsAfter.length === 3 && digitsBefore.length >= 1) {
      return Number(normalized.replace(/[.,]/g, "")) || 0;
    }

    return Number.parseFloat(normalized.replace(",", ".")) || 0;
  }

  return Number(normalized) || 0;
}
