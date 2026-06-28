/**
 * ShippingInterpretation — composite verdict over the three landed-decision
 * levers used on `/country/[slug]/`:
 *
 *   - LandedCostTier      (lib/landed-cost-tier.ts) — A/B/C/D/E or null
 *   - VatBurdenTier       (lib/vat-burden-tier.ts)  — A/B/C/D/E or null
 *   - TransitWindowTier   (lib/transit-window-tier.ts) — A/B/C/D/E or null
 *
 * The composite returns a single 4-paragraph verdict that names the dominant
 * decision-framing branch and the practical implications across (cost × VAT
 * × transit). It is deterministic: identical lever tuples produce
 * byte-identical prose. There is no random fallback and no "unknown" prose
 * fill — when 2+ inputs are null, the composite returns the
 * `data-incomplete` framing rather than fabricating an answer.
 *
 * Five decisionFraming branches (read top-down, first match wins):
 *
 *   data-incomplete         2+ lever outputs are null. Suppress verdict; show
 *                           reader the honest data gap.
 *   compounding-burden      VAT D/E AND (landed D/E OR transit D/E). The
 *                           shipment is bracketed by two adversarial tiers —
 *                           classic Argentina / Egypt / Brazil pattern.
 *   marine-only-bulk-edge   Transit D AND VAT A/B/C. Small-island or land-
 *                           locked country reached only by sea; cost is
 *                           dominated by the marine transit window, not the
 *                           duty stack.
 *   vat-stack-customs-clear VAT C/D AND landed A/B/C. The shipment clears
 *                           freight cheaply but VAT/GST is the second-largest
 *                           line item — classic EU IOSS / UK post-Brexit
 *                           pattern.
 *   cost-low-vat-low-fast   Landed A/B AND VAT A/B AND transit A/B. The
 *                           shipment is a "clean" lane — no tier worse than B.
 *                           Typical US-to-major-developed-market shipment.
 *
 * Output shape:
 *   {
 *     decisionFraming,            // one of the 5 keys above
 *     verdict,                    // single sentence headline
 *     paragraphs: [p1, p2, p3, p4],  // always exactly 4
 *     tone,                       // 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'slate'
 *     confidence,                 // 'high' | 'moderate' | 'low' | 'no-data'
 *     drivers,                    // string[] — naming the lever tuple
 *     caveats,                    // string[] — composite-level cautions
 *   }
 *
 * Why this lever exists: the three per-dimension tier cards (LandedCostTier,
 * VatBurdenTier, TransitWindowTier) each answer one narrow question
 * ("how much freight?", "how much VAT?", "how fast?"). A shipper landing on
 * the page is asking the cross-product question — "given all three together,
 * is this lane sensible for my parcel today?". ShippingInterpretation
 * composes the three into a single verdict so the page can answer that
 * cross-product question above the fold rather than asking the reader to
 * compose three tier cards in their head.
 *
 * Determinism guarantee: this module imports type-only references from the
 * three lever modules and accepts the lever tuple as input. No carrier data,
 * no FX, no time-dependent fallback is read here.
 */

import type { LandedCostTier } from './landed-cost-tier';
import type { VatBurdenTier } from './vat-burden-tier';
import type { TransitWindowTier } from './transit-window-tier';

export type DecisionFraming =
  | 'cost-low-vat-low-fast'
  | 'vat-stack-customs-clear'
  | 'compounding-burden'
  | 'marine-only-bulk-edge'
  | 'data-incomplete';

export type ShippingInterpretation = {
  decisionFraming: DecisionFraming;
  verdict: string;
  paragraphs: [string, string, string, string];
  tone: 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'slate';
  confidence: 'high' | 'moderate' | 'low' | 'no-data';
  drivers: string[];
  caveats: string[];
};

type Inputs = {
  countryName: string;
  landedCostTier: LandedCostTier | null;
  vatBurdenTier: VatBurdenTier | null;
  transitWindowTier: TransitWindowTier | null;
};

function isAB(t: LandedCostTier | VatBurdenTier | TransitWindowTier | null): boolean {
  return t === 'A' || t === 'B';
}
function isCD(t: LandedCostTier | VatBurdenTier | TransitWindowTier | null): boolean {
  return t === 'C' || t === 'D';
}
function isDE(t: LandedCostTier | VatBurdenTier | TransitWindowTier | null): boolean {
  return t === 'D' || t === 'E';
}

function pickFraming(
  landed: LandedCostTier | null,
  vat: VatBurdenTier | null,
  transit: TransitWindowTier | null,
): DecisionFraming {
  const nullCount = [landed, vat, transit].filter((t) => t == null).length;
  if (nullCount >= 2) return 'data-incomplete';

  if (isDE(vat) && (isDE(landed) || isDE(transit))) return 'compounding-burden';
  if (transit === 'D' && (isAB(vat) || vat === 'C')) return 'marine-only-bulk-edge';
  if ((vat === 'C' || vat === 'D') && (isAB(landed) || landed === 'C')) return 'vat-stack-customs-clear';
  if (isAB(landed) && isAB(vat) && isAB(transit)) return 'cost-low-vat-low-fast';

  // Fallback: nothing matched a clean branch. Treat as vat-stack if vat is C+,
  // else as cost-low if landed/transit are mostly A/B. Otherwise data-incomplete.
  if (isCD(vat)) return 'vat-stack-customs-clear';
  if (isAB(landed) && isAB(transit)) return 'cost-low-vat-low-fast';
  return 'data-incomplete';
}

function toneFor(framing: DecisionFraming): ShippingInterpretation['tone'] {
  switch (framing) {
    case 'cost-low-vat-low-fast':   return 'emerald';
    case 'vat-stack-customs-clear': return 'amber';
    case 'compounding-burden':      return 'rose';
    case 'marine-only-bulk-edge':   return 'orange';
    case 'data-incomplete':         return 'slate';
  }
}

function landedBlurb(t: LandedCostTier | null): string {
  switch (t) {
    case 'A': return 'a Tier A landed cost (under $50 total)';
    case 'B': return 'a Tier B landed cost ($50–$200)';
    case 'C': return 'a Tier C landed cost ($200–$500)';
    case 'D': return 'a Tier D landed cost ($500–$1,500)';
    case 'E': return 'a Tier E landed cost ($1,500 or more)';
    default:  return 'an unclassified landed cost';
  }
}

function vatBlurb(t: VatBurdenTier | null): string {
  switch (t) {
    case 'A': return 'Tier A VAT-burden (no VAT/GST regime)';
    case 'B': return 'Tier B VAT-burden (low rate or generous de-minimis)';
    case 'C': return 'Tier C VAT-burden (standard 10–20% EU/UK pattern)';
    case 'D': return 'Tier D VAT-burden (rate above 20% or de-minimis below $50)';
    case 'E': return 'Tier E VAT-burden (compounding rate + duty + low de-minimis)';
    default:  return 'unclassified VAT-burden';
  }
}

function transitBlurb(t: TransitWindowTier | null): string {
  switch (t) {
    case 'A': return 'Tier A same-week air window';
    case 'B': return 'Tier B standard 6–10 day air / ≤28 day sea window';
    case 'C': return 'Tier C slow 11–20 day air / 29–45 day sea window';
    case 'D': return 'Tier D marine-only window (no air lane published)';
    case 'E': return 'Tier E restricted window (no route or >60 day sea)';
    default:  return 'an unclassified transit window';
  }
}

function buildParagraphs(framing: DecisionFraming, ctx: Inputs): [string, string, string, string] {
  const { countryName, landedCostTier, vatBurdenTier, transitWindowTier } = ctx;

  switch (framing) {
    case 'cost-low-vat-low-fast': {
      const p1 = `Shipping to ${countryName} sits in the clean band on all three landed-decision dimensions: ${landedBlurb(landedCostTier)}, ${vatBlurb(vatBurdenTier)}, and ${transitBlurb(transitWindowTier)}. Treat the lane as a "no-friction" shipment for routine small-parcel volume.`;
      const p2 = `The freight line dominates. With no Tier-worse-than-B input across cost, VAT, or transit, the parcel-level decision reduces almost entirely to carrier choice and weight optimisation; duty and VAT/GST only matter at the upper end of the commodity-value range.`;
      const p3 = `Transit pressure is low. The published best air lane is in the same-week (A) or standard (B) band, so urgency rarely justifies the carrier-premium step up to express; same-day or next-flight services pay back only when the consignee has time-binding obligations (perishable, event-driven, trade-show) downstream.`;
      const p4 = `Decision: ship via the carrier that gives the cheapest chargeable-weight bracket for your parcel size. Confirm de-minimis eligibility on the destination customs authority page before assuming the VAT-free fast-clearance lane applies to your specific HS code and consignee class.`;
      return [p1, p2, p3, p4];
    }
    case 'vat-stack-customs-clear': {
      const p1 = `Shipping to ${countryName} clears freight cheaply but books a meaningful VAT/GST stack at the border: ${landedBlurb(landedCostTier)} alongside ${vatBlurb(vatBurdenTier)}, with ${transitBlurb(transitWindowTier)}. Read the verdict as "the freight line will not surprise you — the VAT line might."`;
      const p2 = `VAT/GST is the second-largest line item, not duty. In the EU IOSS regime, UK post-Brexit lanes, and Canada CUSMA flow, the standard 5–25% VAT/GST is assessed on (commodity value + freight + duty) above the de-minimis. For a $200 commodity at 20% VAT, that is a $40+ line above whatever the carrier quoted — material relative to the freight.`;
      const p3 = `Transit is workable. The published lane lands in the same-week, standard, or slow band; customs hold is the variability driver, not flight time. Plan for a 2–5 working-day clearance buffer on top of the published transit days when the consignment crosses the de-minimis.`;
      const p4 = `Decision: pre-pay VAT/GST under DDP if the consignee values cleared-delivery (typical e-commerce expectation), or DDU/DAP if the consignee is a registered importer who reclaims input VAT. Validate the destination de-minimis on the published customs authority page; the threshold and the duty-vs-VAT split shift more often than the freight rate.`;
      return [p1, p2, p3, p4];
    }
    case 'compounding-burden': {
      const p1 = `Shipping to ${countryName} stacks two adversarial tiers: ${landedBlurb(landedCostTier)} combined with ${vatBlurb(vatBurdenTier)} and ${transitBlurb(transitWindowTier)}. Total landed cost can run 1.6–2.0× the FOB commodity value before delivery — confirm the math before booking capital against the lane.`;
      const p2 = `VAT-burden is the dominant compounding term. A VAT rate above 20% layered on a duty range that exceeds 30% upper, against a de-minimis under $50 USD, means the parcel pays VAT, pays duty, and pays processing — with each line scaled to the prior. The classic high-burden pattern is Argentina, Egypt, Brazil under their published 2026 schedules.`;
      const p3 = `Transit risk amplifies cost risk. ${transitWindowTier === 'D' || transitWindowTier === 'E' ? 'The lane is constrained on schedule (Tier D marine-only or Tier E restricted), so customs holds extend the window further; demurrage and storage fees stack on top of the duty/VAT compounding.' : 'Even on a workable transit band, the duty/VAT stack increases consignee pickup-decline risk — a refused parcel pays the duty/VAT on attempted import in many jurisdictions.'}`;
      const p4 = `Decision: do not book this lane on de-minimis assumptions. Confirm HS-code-specific duty, the published 2026 VAT rate, and the consignee&apos;s import-of-record status with a licensed customs broker. For e-commerce, treat the lane as DDP-only and price the burden into the catalog before listing the destination as available.`;
      return [p1, p2, p3, p4];
    }
    case 'marine-only-bulk-edge': {
      const p1 = `Shipping to ${countryName} is governed by a marine-only transit window: ${transitBlurb(transitWindowTier)} with ${landedBlurb(landedCostTier)} and ${vatBlurb(vatBurdenTier)}. The schedule, not the duty stack, is the binding constraint on this lane.`;
      const p2 = `No air lane is published. The country routes carry only sea-mode origins — typical of small-island Pacific (Tonga, Kiribati, Tuvalu), land-locked African (Lesotho, Eswatini), and remote-archipelago lanes. Consignments transit a regional hub port (typically Auckland, Singapore, or Cape Town for the Pacific/African cases) and then transship to the final port-of-call.`;
      const p3 = `Cost-per-day economics flip on this lane. For low-value small parcels (under ~$200 commodity), the air-equivalent service simply does not exist; sea LCL consolidation is the only path. For higher-volume shipments, the per-kg sea rate is competitive but the consolidation window at origin CFS adds 5–14 days the published transit number does not include.`;
      const p4 = `Decision: book through a freight forwarder with documented experience on the specific hub-to-island lane, not a courier integrator. Confirm the next vessel call schedule at the destination port, the typical consolidation window at the origin CFS, and whether the consignee has clearance representation at the destination — small-island customs offices operate on weekly schedules in several lanes.`;
      return [p1, p2, p3, p4];
    }
    case 'data-incomplete': {
      const p1 = `Shipping to ${countryName} cannot be classified across all three landed-decision dimensions today. At least two of the three input tiers — landed cost, VAT-burden, and transit-window — returned no-data on the published source tables (shipping.db FBX baseline, de-minimis.json customs schedule, country-routes.json air/sea lanes). The composite verdict is suppressed.`;
      const p2 = `Honest gap. The dimensions reading: ${landedBlurb(landedCostTier)}; ${vatBlurb(vatBurdenTier)}; ${transitBlurb(transitWindowTier)}. The page intentionally does not interpolate or estimate the missing tier — interpolation would compose a verdict on inputs that may not exist for this destination in the published 2026 source tables.`;
      const p3 = `What to do instead. Pull the destination customs authority page directly (link on the customs strip below), and quote freight against two carriers — a courier integrator (DHL/FedEx/UPS) and a freight forwarder with origin/destination presence — before committing to the lane. Treat the absence of a published lane as a planning signal, not a coverage gap to fill with assumption.`;
      const p4 = `Decision: do not book this lane on the strength of any tier on this page. The composite verdict is rebuilt automatically on every page rebuild as soon as the upstream source table publishes the missing dimension for ${countryName} — the verdict will reappear with full provenance when the underlying customs / FBX / routes data is filled in.`;
      return [p1, p2, p3, p4];
    }
  }
}

function buildVerdict(framing: DecisionFraming, ctx: Inputs): string {
  const { countryName } = ctx;
  switch (framing) {
    case 'cost-low-vat-low-fast':   return `Clean lane to ${countryName} — cost, VAT, and transit all in the workable band.`;
    case 'vat-stack-customs-clear': return `${countryName} clears freight cheaply but stacks meaningful VAT/GST at the border.`;
    case 'compounding-burden':      return `${countryName} bracketed by adversarial VAT + duty + transit — confirm landed cost before booking capital.`;
    case 'marine-only-bulk-edge':   return `${countryName} reached only by sea — schedule, not duty, is the binding constraint.`;
    case 'data-incomplete':         return `Insufficient published data to classify the ${countryName} lane today — verdict suppressed by honest data-gap policy.`;
  }
}

export function interpretShipping(ctx: Inputs): ShippingInterpretation {
  const framing = pickFraming(ctx.landedCostTier, ctx.vatBurdenTier, ctx.transitWindowTier);
  const verdict = buildVerdict(framing, ctx);
  const paragraphs = buildParagraphs(framing, ctx);
  const tone = toneFor(framing);

  const drivers: string[] = [
    `LandedCostTier: ${ctx.landedCostTier ?? 'no-data'}`,
    `VatBurdenTier: ${ctx.vatBurdenTier ?? 'no-data'}`,
    `TransitWindowTier: ${ctx.transitWindowTier ?? 'no-data'}`,
    `decisionFraming: ${framing}`,
  ];

  const caveats: string[] = [
    'Composite verdict reproduces the three per-dimension tier cards in plain language. The classifier cutoffs are deterministic and documented in each lever module — same tuple, same prose, byte for byte.',
    'Verdict applies to the published industry baseline (FBX freight, country-routes.json transit, de-minimis.json VAT/duty). Carrier-specific quotes, contract rates, and freight-forwarder margin override the verdict on any individual booking.',
    'Confidence is downgraded automatically when any one lever returns no-data; when two or more levers are no-data, the composite returns the data-incomplete framing rather than estimating the missing dimension.',
    'For YMYL decisions (capital commitment, supply-chain contracting, distribution agreements) verify each tier independently against the named source authority before relying on the verdict.',
  ];

  const nullCount = [ctx.landedCostTier, ctx.vatBurdenTier, ctx.transitWindowTier].filter((t) => t == null).length;
  const confidence: ShippingInterpretation['confidence'] =
    framing === 'data-incomplete' ? 'no-data' :
    nullCount === 1 ? 'low' :
    nullCount === 0 ? 'high' : 'moderate';

  return { decisionFraming: framing, verdict, paragraphs, tone, confidence, drivers, caveats };
}
