/**
 * LandedCostTier — 5-band deterministic classifier for the total landed cost
 * of a small-parcel international shipment.
 *
 * Inputs (all USD, all per-shipment for a reference parcel):
 *   - baselinePerKg     Freightos Baltic Index-derived per-kg shipping baseline
 *                       (from shipping.db avg_shipping_cost_kg_sea or _air).
 *   - weightKg          Reference shipment weight in kilograms. Default 1 kg.
 *   - hsDutyPct         Most-favored-nation duty rate. Pull from
 *                       de-minimis.json `generalDutyPctRange` midpoint or a
 *                       commodity-specific WCO HS 6-digit lookup.
 *   - commodityValueUsd Optional commodity value the duty applies to. If
 *                       supplied, duty = commodityValueUsd × hsDutyPct/100.
 *                       If omitted, duty is computed against shippingCostUsd
 *                       as a conservative lower-bound proxy (documented in
 *                       the drivers field so readers know the assumption).
 *   - processingFeeUsd  Flat customs processing fee (CBP MPF for US, or the
 *                       destination country&apos;s equivalent). Default 0.
 *
 * Output: { tier, totalCostUsd, shippingCostUsd, dutyCostUsd,
 *           processingFeeUsd, hsDutyPct, drivers, caveats, confidence }
 *
 * Tier cutoffs (totalCostUsd):
 *   A  < $50      Very low — typical sub-1kg postal letter or under-de-minimis air parcel.
 *   B  $50–$200   Low     — typical 1–3kg air parcel to a developed market.
 *   C  $200–$500  Moderate — typical 5–10kg air parcel or high-duty 1–3kg.
 *   D  $500–$1500 High    — typical 10–30kg air parcel or low-volume sea LCL.
 *   E  ≥ $1500    Very high — sea LCL, full carton air, or large commercial shipment.
 *
 * Determinism: same inputs → same tier. No randomness, no time-dependent
 * fallbacks. honest no-data handling: baselinePerKg null/0/non-finite →
 * tier: null, confidence: 'no-data'.
 */

export type LandedCostTier = 'A' | 'B' | 'C' | 'D' | 'E';

export const TIER_CUTOFF_SUMMARY: { tier: LandedCostTier; lowUsd: number; highUsd: number | null; label: string }[] = [
  { tier: 'A', lowUsd: 0, highUsd: 50, label: 'Very low' },
  { tier: 'B', lowUsd: 50, highUsd: 200, label: 'Low' },
  { tier: 'C', lowUsd: 200, highUsd: 500, label: 'Moderate' },
  { tier: 'D', lowUsd: 500, highUsd: 1500, label: 'High' },
  { tier: 'E', lowUsd: 1500, highUsd: null, label: 'Very high' },
];

export function tierLabel(tier: LandedCostTier | null): string {
  if (tier == null) return 'Not classified';
  const row = TIER_CUTOFF_SUMMARY.find((r) => r.tier === tier);
  return row ? `Tier ${row.tier} — ${row.label}` : `Tier ${tier}`;
}

export function tierBlurb(tier: LandedCostTier | null): string {
  switch (tier) {
    case 'A': return 'Under $50 total landed cost — typical sub-1kg postal letter or under-de-minimis air parcel.';
    case 'B': return '$50–$200 total landed cost — typical 1–3kg air parcel to a developed market.';
    case 'C': return '$200–$500 total landed cost — typical 5–10kg air parcel or a 1–3kg parcel into a high-duty country.';
    case 'D': return '$500–$1,500 total landed cost — typical 10–30kg air parcel or low-volume sea LCL.';
    case 'E': return '$1,500 or more total landed cost — sea LCL, full-carton air, or a large commercial shipment.';
    default:  return 'Insufficient data to classify — confirm with the carrier and a customs broker.';
  }
}

export function tierToneColor(tier: LandedCostTier | null): string {
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
  baselinePerKg: number | null | undefined;
  weightKg?: number;
  hsDutyPct?: number | null;
  commodityValueUsd?: number | null;
  processingFeeUsd?: number | null;
  mode?: 'sea' | 'air';
};

type DecodeResult = {
  tier: LandedCostTier | null;
  totalCostUsd: number | null;
  shippingCostUsd: number | null;
  dutyCostUsd: number | null;
  processingFeeUsd: number;
  hsDutyPct: number | null;
  weightKg: number;
  mode: 'sea' | 'air';
  drivers: string[];
  caveats: string[];
  confidence: 'high' | 'moderate' | 'low' | 'no-data';
};

function classifyTier(totalUsd: number): LandedCostTier {
  if (totalUsd < 50) return 'A';
  if (totalUsd < 200) return 'B';
  if (totalUsd < 500) return 'C';
  if (totalUsd < 1500) return 'D';
  return 'E';
}

export function classifyLandedCostTier(opts: DecodeOpts): DecodeResult {
  const weightKg = opts.weightKg ?? 1;
  const mode = opts.mode ?? 'sea';
  const processingFeeUsd = opts.processingFeeUsd ?? 0;

  const baseline = opts.baselinePerKg;
  if (baseline == null || !Number.isFinite(baseline) || baseline <= 0) {
    return {
      tier: null,
      totalCostUsd: null,
      shippingCostUsd: null,
      dutyCostUsd: null,
      processingFeeUsd,
      hsDutyPct: opts.hsDutyPct ?? null,
      weightKg,
      mode,
      drivers: [],
      caveats: ['No FBX-derived baseline available for this country/mode — classification suppressed.'],
      confidence: 'no-data',
    };
  }

  const shippingCostUsd = baseline * weightKg;
  const hsDutyPct = opts.hsDutyPct ?? null;

  let dutyCostUsd = 0;
  const drivers: string[] = [];
  const caveats: string[] = [];

  drivers.push(
    `FBX-derived ${mode === 'sea' ? 'sea' : 'air'} baseline $${baseline.toFixed(2)}/kg × ${weightKg}kg = $${shippingCostUsd.toFixed(2)} shipping cost.`,
  );

  if (hsDutyPct != null && Number.isFinite(hsDutyPct) && hsDutyPct > 0) {
    if (opts.commodityValueUsd != null && Number.isFinite(opts.commodityValueUsd) && opts.commodityValueUsd > 0) {
      dutyCostUsd = opts.commodityValueUsd * (hsDutyPct / 100);
      drivers.push(
        `WCO HS duty ${hsDutyPct.toFixed(1)}% on commodity value $${opts.commodityValueUsd.toFixed(2)} = $${dutyCostUsd.toFixed(2)} duty.`,
      );
    } else {
      dutyCostUsd = shippingCostUsd * (hsDutyPct / 100);
      drivers.push(
        `WCO HS duty ${hsDutyPct.toFixed(1)}% applied to shipping cost as a conservative lower-bound proxy (commodity value not provided) = $${dutyCostUsd.toFixed(2)} duty.`,
      );
      caveats.push(
        'Duty proxy assumes commodity value equals shipping cost; actual duty scales with commercial invoice value and may be materially higher.',
      );
    }
  } else {
    drivers.push('No HS duty applied (rate omitted or zero).');
  }

  if (processingFeeUsd > 0) {
    drivers.push(`Customs processing fee $${processingFeeUsd.toFixed(2)} (CBP MPF or destination equivalent).`);
  }

  const totalCostUsd = shippingCostUsd + dutyCostUsd + processingFeeUsd;
  const tier = classifyTier(totalCostUsd);

  // Universal caveats — apply on every classified shipment
  caveats.push('FBX baseline reflects spot-rate capacity, not the bunker adjustment factor (BAF), peak-season surcharge, or general rate increase (GRI) applied at booking.');
  caveats.push('WB LPI score adjusts the country-level transit-day baseline, not the per-kg shipping cost — transit reliability and cost are separate dimensions.');
  caveats.push('WCO HS classification is six-digit; product-specific anti-dumping, countervailing, or Section 301 surtaxes layered at the country&apos;s ten-digit tariff line are not captured.');
  caveats.push('CBP Section 321 de-minimis of $800 applies to the US; equivalent thresholds in other countries are encoded in de-minimis.json but change independently.');
  caveats.push('Cargo insurance, freight-forwarder margin, demurrage, and last-mile delivery are not captured — confirm with a freight forwarder or licensed customs broker before booking.');

  // Confidence calibration
  let confidence: DecodeResult['confidence'];
  if (hsDutyPct != null && opts.commodityValueUsd != null && processingFeeUsd > 0) {
    confidence = 'high';
  } else if (hsDutyPct != null) {
    confidence = 'moderate';
  } else {
    confidence = 'low';
  }

  return {
    tier,
    totalCostUsd,
    shippingCostUsd,
    dutyCostUsd,
    processingFeeUsd,
    hsDutyPct,
    weightKg,
    mode,
    drivers,
    caveats,
    confidence,
  };
}
