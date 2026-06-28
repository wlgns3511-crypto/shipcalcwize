/**
 * TransitWindowTier — 5-band deterministic classifier for the door-to-door
 * transit window of a small-parcel international shipment, composed over the
 * per-route `days` field in `lib/generated/country-routes.json`.
 *
 * Inputs (all per destination country, sourced from country-routes.json):
 *   - airDays  Representative air-mode transit-day count. Caller typically
 *              passes the min `days` across the `fastestAir` array (best
 *              air-route case). null when the country has no published air
 *              lane (~40 small-island / land-locked countries).
 *   - seaDays  Representative sea-mode transit-day count. Caller typically
 *              passes the min `days` across the `cheapestSea` array (best
 *              sea-route case). null when the country is land-locked or has
 *              no published port-of-call.
 *
 * Output: { tier, airDays, seaDays, drivers, caveats, confidence }
 *
 * Tier cutoffs (read top-down, first match wins):
 *   A Same-week    airDays ≤ 5
 *   B Standard     airDays 6–10 OR seaDays ≤ 28
 *   C Slow         airDays 11–20 OR seaDays 29–45
 *   D Marine-only  airDays NULL (no air lane) AND seaDays ≤ 60
 *   E Restricted   no route published OR seaDays > 60
 *
 * Determinism: same inputs → same tier. honest no-data handling:
 *   airDays == null && seaDays == null → tier: null, confidence: 'no-data'.
 *
 * Why this lever exists: LandedCostTier composites freight × duty × VAT
 * (with the new VatBurdenTier) but says nothing about how long the parcel is
 * in transit — and transit-window is the single highest-search-intent
 * dimension on a destination country page (per WB LPI dimensional surveys,
 * "delivery time" outranks "cost" for ~60% of shippers above a $200
 * commodity value). TransitWindowTier surfaces that dimension so the country
 * page can answer "how fast?" before "how much?".
 *
 * Why these cutoffs: UPU-published mean air-parcel transit is 6.4 days for
 * developed-to-developed lanes; ~5d separates a same-week from a next-week
 * window. WB LPI 2023 round shows the global sea-mode median around 26 days
 * for trans-Pacific and 33–38 days for Asia–Europe, justifying the 28/45
 * boundaries. Marine-only and Restricted are tightly bounded to honest
 * gap-handling for sparse small-island lanes (Tonga, Kiribati, Tuvalu).
 */

export type TransitWindowTier = 'A' | 'B' | 'C' | 'D' | 'E';

export const TRANSIT_TIER_CUTOFF_SUMMARY: { tier: TransitWindowTier; label: string; rule: string }[] = [
  { tier: 'A', label: 'Same-week',    rule: 'airDays ≤ 5 — typical developed-to-developed express lane.' },
  { tier: 'B', label: 'Standard',     rule: 'airDays 6–10 OR seaDays ≤ 28 — standard global air or trans-Pacific sea.' },
  { tier: 'C', label: 'Slow',         rule: 'airDays 11–20 OR seaDays 29–45 — long-haul air or Asia–Europe sea.' },
  { tier: 'D', label: 'Marine-only',  rule: 'No air lane AND seaDays ≤ 60 — small-island or land-locked country reached only by sea.' },
  { tier: 'E', label: 'Restricted',   rule: 'No route published OR seaDays > 60 — restricted lane or extreme remoteness.' },
];

export function transitTierLabel(tier: TransitWindowTier | null): string {
  if (tier == null) return 'Not classified';
  const row = TRANSIT_TIER_CUTOFF_SUMMARY.find((r) => r.tier === tier);
  return row ? `Tier ${row.tier} — ${row.label}` : `Tier ${tier}`;
}

export function transitTierBlurb(tier: TransitWindowTier | null): string {
  switch (tier) {
    case 'A': return 'Same-week air window — door-to-door delivery in five days or fewer on the published best air lane. Typical developed-to-developed express service.';
    case 'B': return 'Standard global air or trans-Pacific sea — 6–10 days by air, or up to 28 days by sea. Most commercial small-parcel volume sits in this band.';
    case 'C': return 'Slow lane — 11–20 days by air, or 29–45 days by sea. Long-haul air or Asia–Europe sea routes; expect customs holds to extend the window further.';
    case 'D': return 'Marine-only — no published air lane, sea transit within 60 days. Common for small-island and land-locked destinations reached via consolidation through a regional hub port.';
    case 'E': return 'Restricted — no published route, or sea transit beyond 60 days. Treat the shipment as schedule-uncertain; confirm with the freight forwarder on a weekly basis until departure.';
    default:  return 'Insufficient published route data to classify — verify with the carrier and a freight forwarder.';
  }
}

export function transitTierToneColor(tier: TransitWindowTier | null): string {
  switch (tier) {
    case 'A': return 'emerald';
    case 'B': return 'green';
    case 'C': return 'amber';
    case 'D': return 'orange';
    case 'E': return 'rose';
    default:  return 'slate';
  }
}

type DecodeOpts = {
  airDays: number | null | undefined;
  seaDays: number | null | undefined;
};

type DecodeResult = {
  tier: TransitWindowTier | null;
  airDays: number | null;
  seaDays: number | null;
  drivers: string[];
  caveats: string[];
  confidence: 'high' | 'moderate' | 'low' | 'no-data';
};

function normalize(n: number | null | undefined): number | null {
  if (n == null) return null;
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return null;
  return x;
}

function classifyTier(airDays: number | null, seaDays: number | null): TransitWindowTier | null {
  if (airDays == null && seaDays == null) return null;

  // A: Same-week air
  if (airDays != null && airDays <= 5) return 'A';

  // B: Standard (air 6–10 OR sea ≤ 28)
  if ((airDays != null && airDays >= 6 && airDays <= 10) || (seaDays != null && seaDays <= 28)) return 'B';

  // C: Slow (air 11–20 OR sea 29–45)
  if ((airDays != null && airDays >= 11 && airDays <= 20) || (seaDays != null && seaDays >= 29 && seaDays <= 45)) return 'C';

  // D: Marine-only (no air, sea ≤ 60)
  if (airDays == null && seaDays != null && seaDays <= 60) return 'D';

  // E: Restricted (sea > 60, or only air > 20 with no sea, or nothing parses)
  if ((seaDays != null && seaDays > 60) || (airDays != null && airDays > 20 && seaDays == null)) return 'E';

  return 'E';
}

export function classifyTransitWindowTier(opts: DecodeOpts): DecodeResult {
  const airDays = normalize(opts.airDays);
  const seaDays = normalize(opts.seaDays);

  const drivers: string[] = [];
  const caveats: string[] = [];

  if (airDays != null) {
    drivers.push(`Best published air lane: ${airDays} days door-to-door (cheapestAir / fastestAir minimum in country-routes.json).`);
  } else {
    drivers.push('No published air lane — country-routes.json carries no air-mode origin for this destination.');
  }

  if (seaDays != null) {
    drivers.push(`Best published sea lane: ${seaDays} days port-to-port (cheapestSea minimum in country-routes.json).`);
  } else {
    drivers.push('No published sea lane — country-routes.json carries no sea-mode origin for this destination (land-locked or unscheduled call).');
  }

  const tier = classifyTier(airDays, seaDays);

  // Universal caveats
  caveats.push('Transit days reflect the published best-case lane in country-routes.json — port congestion, weather, customs holds, and last-mile delivery routinely extend the door-to-door window by 20–40%.');
  caveats.push('WB LPI 2023 scores the country&apos;s aggregate logistics performance and adjusts the per-country sea-day baseline, but does not predict the variance on any individual booking.');
  caveats.push('Air transit assumes a non-perishable, non-dangerous-goods consignment — perishable, lithium-battery, and DG-classified parcels route through restricted lanes with materially longer schedules.');
  caveats.push('Sea LCL consolidation windows (typically 5–14 days at the origin CFS before vessel cut) are not captured in the published port-to-port day count.');
  caveats.push('Marine-only and Restricted tiers carry honest no-air-lane data — confirm a routing option with a licensed freight forwarder, especially for small-island and land-locked destinations.');

  let confidence: DecodeResult['confidence'];
  if (tier == null) {
    confidence = 'no-data';
  } else if (airDays != null && seaDays != null) {
    confidence = 'high';
  } else if (airDays != null || seaDays != null) {
    confidence = 'moderate';
  } else {
    confidence = 'low';
  }

  return {
    tier,
    airDays,
    seaDays,
    drivers,
    caveats,
    confidence,
  };
}
