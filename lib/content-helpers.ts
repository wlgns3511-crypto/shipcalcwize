// HCU 2026-04-29 — Pure formatting + deterministic variant picking.
// No SQL, no JSON, no React. Safe for use in any RSC or build script.

export function hashSlug(seed: string): number {
  // Simple deterministic 32-bit hash. Stable across SSR/build.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function pickVariant<T>(items: readonly T[], seed: string): T {
  if (items.length === 0) throw new Error("pickVariant: empty items");
  const idx = hashSlug(seed) % items.length;
  return items[idx]!;
}

export function formatNumber(n: number, locale = "en-US", maxFrac = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: maxFrac }).format(n);
}

export function formatCurrency(n: number, currency: string, locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${formatNumber(n, locale)}`;
  }
}

export function oneInEveryN(ratio: number): string {
  if (!isFinite(ratio) || ratio <= 0) return "rare";
  const n = Math.round(1 / ratio);
  return `1 in every ${n}`;
}

export function ratioPhrase(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  const pct = Math.round((numerator / denominator) * 100);
  return `${pct}%`;
}

export function aOrAn(word: string): "a" | "an" {
  if (!word) return "a";
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

export function daysToWeeks(days: number): string {
  if (days <= 0) return "—";
  if (days <= 2) return `${days}–${days + 1} days`;
  if (days <= 6) return `${days}–${days + 2} days`;
  if (days <= 9) return "about 1 week";
  if (days <= 16) return `${Math.round(days / 7)}–${Math.round(days / 7) + 1} weeks`;
  return `about ${Math.round(days / 7)} weeks`;
}

export function priceRange(values: readonly number[]): string {
  if (values.length === 0) return "—";
  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[0]!.toFixed(2);
  const hi = sorted[sorted.length - 1]!.toFixed(2);
  return lo === hi ? `$${lo}` : `$${lo}–$${hi}`;
}
