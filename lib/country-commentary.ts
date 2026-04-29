// HCU 2026-04-29 — Country-level commentary matrix.
// Slug-hash deterministic variant pick. Each variant is a factual sentence,
// not marketing copy. Bands derived from cost/transit/de-minimis numbers.

import { pickVariant } from "@/lib/content-helpers";

export type CostBand = "very-cheap" | "cheap" | "mid" | "premium" | "ultra-premium";
export type TransitBand = "fast" | "typical" | "slow" | "very-slow";
export type DeMinimisBand = "high" | "mid" | "low" | "none";

export function bandCost(costKgAir: number): CostBand {
  if (costKgAir < 6) return "very-cheap";
  if (costKgAir < 8) return "cheap";
  if (costKgAir < 11) return "mid";
  if (costKgAir < 15) return "premium";
  return "ultra-premium";
}

export function bandTransit(daysAir: number): TransitBand {
  if (daysAir <= 4) return "fast";
  if (daysAir <= 7) return "typical";
  if (daysAir <= 12) return "slow";
  return "very-slow";
}

export function bandDeMinimis(deMinimisUsd: number | null): DeMinimisBand {
  if (deMinimisUsd === null) return "none";
  if (deMinimisUsd >= 500) return "high";
  if (deMinimisUsd >= 100) return "mid";
  if (deMinimisUsd > 0) return "low";
  return "none";
}

const COST_VARIANTS: Record<CostBand, string[]> = {
  "very-cheap": [
    "Cheapest air lanes here cluster well below the global mean — the long tail of premium origins drags up the average.",
    "Below-average air rates dominate the top 10 cheapest origins, indicating dense forwarder competition.",
    "Air freight pricing is structurally low — most savings come from origin choice, not carrier negotiation.",
  ],
  cheap: [
    "Cheapest air lanes sit modestly below the global mean; sea is the better bet for non-urgent volume.",
    "Air pricing is competitive but not exceptional; most cost wins come from sea consolidation.",
    "Prices benefit from regional consolidation hubs — direct from-origin shipping rarely beats pooled.",
  ],
  mid: [
    "Air rates land near the global average — origin choice and carrier negotiation move the needle equally.",
    "Lane economics favor neither extreme; commodity weight breakpoint matters more than cheapest origin.",
    "Mid-tier pricing — last-mile fees and chargeable-weight rules will dominate any tight quote.",
  ],
  premium: [
    "Air rates run above the global average; budget for surcharges and consider sea for any non-urgent freight.",
    "Premium air pricing means consolidators offer outsized savings versus express carriers on most lanes.",
    "Geography or fuel premiums push pricing up — lock in long-tenor contracts where possible.",
  ],
  "ultra-premium": [
    "Air rates rank among the world's highest; sea or postal options are usually the only economical choice.",
    "Limited carrier coverage and remote geography mean expect 2× the global mean per kg.",
    "Specialty freight rates dominate — direct contracts with regional carriers beat global door-to-door.",
  ],
};

const TRANSIT_VARIANTS: Record<TransitBand, string[]> = {
  fast: [
    "Air transit on the cheapest lanes runs faster than most regional benchmarks.",
    "Quick clearance times here favor express e-commerce flows; sea adds 4–6 weeks for the same lanes.",
    "Short transit is a structural feature of this destination's main hub network.",
  ],
  typical: [
    "Air transit aligns with the global median; sea ranges 4–8 weeks depending on origin port.",
    "Typical transit windows — no structural delay, but customs holds add 1–3 days variance.",
    "Mid-range transit; carrier choice (express vs. consolidator) matters more than origin distance.",
  ],
  slow: [
    "Air transit runs longer than the global median — limited direct flights from many origins.",
    "Slow transit is common; many origins route through a regional hub adding 1–2 transfer days.",
    "Air takes longer because most origins lack direct service — door-to-door includes 1–2 transfer hops.",
  ],
  "very-slow": [
    "Transit is slow even on cheapest lanes; remote geography forces multiple transfers.",
    "Expect 10+ days air for most origins; sea is impractical for time-sensitive goods.",
    "Long transits are structural — limited carrier presence, no direct trunk routes from most origins.",
  ],
};

const CUSTOMS_VARIANTS: Record<DeMinimisBand, string[]> = {
  high: [
    "Generous de minimis means most consumer e-commerce arrives duty-free; commercial volume still triggers full duty + VAT.",
    "High duty-free threshold favors small-parcel flows; B2B shipments cross the threshold quickly on weight or value.",
    "The de-minimis line is well above typical e-commerce order values — duty hits primarily commercial freight.",
  ],
  mid: [
    "Mid-range de minimis catches most large e-commerce orders — split shipments only help up to the per-parcel cap.",
    "VAT applies on most imports above a moderate threshold; budget the VAT separately from carrier quote.",
    "De-minimis covers small parcels; treat any commercial volume as fully dutiable.",
  ],
  low: [
    "Low de-minimis means even small e-commerce orders pay VAT or duty; surprise costs at delivery are common.",
    "Most parcels above ~$50 USD-equivalent attract duty + tax; price the customs cost into the quote upfront.",
    "Low duty-free threshold makes customs cost a meaningful share of the landed price for typical orders.",
  ],
  none: [
    "No formal de minimis — every commercial parcel attracts duty and tax regardless of declared value.",
    "Customs treats all imports as fully dutiable; budget duty + VAT into every quote.",
    "Without a de-minimis exemption, expect customs cost on every shipment, no matter how small.",
  ],
};

const PRACTICAL_VARIANTS: string[] = [
  "Provide HS codes on commercial invoices — misclassification is the most common clearance delay.",
  "For commercial shipments, declared value, HS code, and origin certificate determine final landed cost.",
  "Lithium-ion, food, cosmetics, and supplements often need special permits — verify before booking.",
  "Verify the consignee's local tax ID before pickup; missing IDs cause multi-day customs holds.",
  "Insurance is sold per-package by carriers; declared value insurance covers loss but not customs delay.",
  "For routine commercial flows, build a 7–10 day customs buffer into delivery promises.",
];

export type Commentary = {
  costSummary: string;
  transitSummary: string;
  customsSummary: string;
  practicalTip: string;
};

export function getCommentary(
  slug: string,
  bands: { cost: CostBand; transit: TransitBand; deMinimis: DeMinimisBand },
): Commentary {
  return {
    costSummary: pickVariant(COST_VARIANTS[bands.cost], `${slug}|cost`),
    transitSummary: pickVariant(TRANSIT_VARIANTS[bands.transit], `${slug}|transit`),
    customsSummary: pickVariant(CUSTOMS_VARIANTS[bands.deMinimis], `${slug}|customs`),
    practicalTip: pickVariant(PRACTICAL_VARIANTS, `${slug}|tip`),
  };
}
