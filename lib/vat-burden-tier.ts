/**
 * VatBurdenTier — 5-band deterministic classifier for the destination-country
 * VAT/GST + de-minimis combination that drives the second-largest line item
 * on a small-parcel international shipment (after carrier freight).
 *
 * Inputs (all per destination country, sourced from de-minimis.json or the
 * caller&apos;s own published-customs lookup):
 *   - vatOrGstPct        Standard-rate VAT/GST in percent. null = no VAT
 *                        regime (US, HK as documented in de-minimis.json).
 *   - deMinimisLocal     De-minimis threshold in local currency, as published
 *                        by the destination customs authority. null when the
 *                        country publishes no general threshold.
 *   - currency           ISO 4217 currency code (matches de-minimis.json
 *                        `currency`). Used to convert deMinimisLocal → USD.
 *   - deMinimisUsd       Optional override. If passed, skips local-currency
 *                        FX and uses this value directly for the tier cutoff.
 *   - dutyRangeUpperPct  Upper bound of the generalDutyPctRange (e.g. 17 for
 *                        EU "0-17"). Used only for Tier E compounding gate.
 *
 * Output: { tier, vatPct, deMinimisUsd, deMinimisLocal, currency,
 *           dutyRangeUpperPct, drivers, caveats, confidence }
 *
 * Tier cutoffs:
 *   A None         vatOrGstPct == null OR vatOrGstPct === 0
 *   B Low          vatOrGstPct < 10 OR deMinimisUsd ≥ 800
 *   C Standard-EU  vatOrGstPct 10–20 AND deMinimisUsd 50–200
 *   D High         vatOrGstPct > 20 OR deMinimisUsd < 50
 *   E Compounding  vatOrGstPct > 20 AND dutyRangeUpperPct > 30 AND deMinimisUsd < 50
 *
 * Determinism: same inputs → same tier. honest no-data handling:
 *   vatOrGstPct === null && deMinimisUsd === null → tier: null,
 *   confidence: 'no-data'.
 *
 * Why this lever exists: LandedCostTier composites freight × duty × processing
 * but does not isolate the VAT/GST line. Many shippers experience the duty
 * line as "small" and the VAT line as "the part that doubled the bill" —
 * especially across EU IOSS, UK post-Brexit, and high-VAT jurisdictions
 * (Norway 25%, Hungary 27%, Argentina 21% + perception fees). VatBurdenTier
 * surfaces that dimension so the country page can name it explicitly.
 *
 * FX policy: USD conversion uses a static FX_RATES_USD table dated to the
 * de-minimis.json `_meta._updated` snapshot. This deliberately ignores
 * intra-quarter FX drift — the tier cutoffs ($50/$200/$800) are wide enough
 * that ±10% FX moves never cross a boundary for the published thresholds.
 * Callers needing live FX should pass deMinimisUsd directly.
 */

export type VatBurdenTier = 'A' | 'B' | 'C' | 'D' | 'E';

export const VAT_TIER_CUTOFF_SUMMARY: { tier: VatBurdenTier; label: string; rule: string }[] = [
  { tier: 'A', label: 'None', rule: 'No VAT/GST regime (vatOrGstPct null or 0).' },
  { tier: 'B', label: 'Low', rule: 'VAT < 10% OR de-minimis ≥ $800 USD.' },
  { tier: 'C', label: 'Standard-EU', rule: 'VAT 10–20% AND de-minimis $50–$200 USD (typical EU IOSS/UK/CA).' },
  { tier: 'D', label: 'High', rule: 'VAT > 20% OR de-minimis < $50 USD.' },
  { tier: 'E', label: 'Compounding', rule: 'VAT > 20% AND duty upper > 30% AND de-minimis < $50 USD.' },
];

export function vatTierLabel(tier: VatBurdenTier | null): string {
  if (tier == null) return 'Not classified';
  const row = VAT_TIER_CUTOFF_SUMMARY.find((r) => r.tier === tier);
  return row ? `Tier ${row.tier} — ${row.label}` : `Tier ${tier}`;
}

export function vatTierBlurb(tier: VatBurdenTier | null): string {
  switch (tier) {
    case 'A': return 'No VAT/GST regime — the destination customs authority does not levy a value-added or general sales tax on imports.';
    case 'B': return 'Low VAT-burden tier — either the standard VAT rate is under 10% or the de-minimis threshold is at least USD $800, so small parcels typically clear without VAT.';
    case 'C': return 'Standard EU/UK-style burden — VAT is in the 10–20% band and the de-minimis sits in the $50–$200 USD range. Most commercial parcels owe VAT at the border; many low-value parcels still clear duty-free.';
    case 'D': return 'High VAT-burden tier — either the rate is above 20% or the de-minimis is under $50 USD. VAT typically dominates the bill above freight.';
    case 'E': return 'Compounding burden — high VAT (>20%) stacks against a wide duty range (>30% upper) and a low de-minimis (<$50). Total landed cost can run 1.6–2× the FOB commodity value.';
    default:  return 'Insufficient published VAT or de-minimis data to classify — verify with the destination customs authority and a licensed customs broker.';
  }
}

export function vatTierToneColor(tier: VatBurdenTier | null): string {
  switch (tier) {
    case 'A': return 'emerald';
    case 'B': return 'green';
    case 'C': return 'amber';
    case 'D': return 'orange';
    case 'E': return 'rose';
    default:  return 'slate';
  }
}

/**
 * Static FX rates pinned to de-minimis.json `_meta._updated` (2026-Q1).
 * Each value is "1 unit of local currency in USD". Tier cutoffs are wide
 * enough that intra-quarter drift cannot reclassify a country.
 *
 * Currencies present in de-minimis.json: USD, CAD, MXN, GBP, EUR, NOK, CHF,
 * SEK, DKK, JPY, KRW, HKD, SGD, AUD, NZD, BRL, CLP, ARS, ZAR, AED, SAR, ILS,
 * TRY, RUB, INR, IDR, MYR, THB, VND, PHP, CNY, TWD, HUF, RON, BGN, PLN, CZK,
 * EGP, NGN.
 */
export const FX_RATES_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.73,
  MXN: 0.058,
  AUD: 0.66,
  NZD: 0.61,
  JPY: 0.0067,
  KRW: 0.00076,
  CNY: 0.14,
  HKD: 0.128,
  SGD: 0.74,
  TWD: 0.031,
  CHF: 1.13,
  NOK: 0.094,
  SEK: 0.094,
  DKK: 0.145,
  PLN: 0.25,
  HUF: 0.0028,
  RON: 0.22,
  BGN: 0.55,
  CZK: 0.043,
  TRY: 0.028,
  RUB: 0.011,
  INR: 0.012,
  IDR: 0.000063,
  MYR: 0.22,
  THB: 0.028,
  VND: 0.000040,
  PHP: 0.017,
  BRL: 0.20,
  CLP: 0.0011,
  ARS: 0.0011,
  ZAR: 0.054,
  AED: 0.272,
  SAR: 0.267,
  ILS: 0.27,
  EGP: 0.020,
  NGN: 0.00066,
};

export function deMinimisLocalToUsd(local: number | null | undefined, currency: string | null | undefined): number | null {
  if (local == null || !Number.isFinite(local) || local < 0) return null;
  if (!currency) return null;
  const rate = FX_RATES_USD[currency.toUpperCase()];
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return null;
  return local * rate;
}

type DecodeOpts = {
  vatOrGstPct: number | null | undefined;
  deMinimisLocal?: number | null;
  currency?: string | null;
  deMinimisUsd?: number | null;
  dutyRangeUpperPct?: number | null;
};

type DecodeResult = {
  tier: VatBurdenTier | null;
  vatPct: number | null;
  deMinimisUsd: number | null;
  deMinimisLocal: number | null;
  currency: string | null;
  dutyRangeUpperPct: number | null;
  drivers: string[];
  caveats: string[];
  confidence: 'high' | 'moderate' | 'low' | 'no-data';
};

function classifyTier(
  vatPct: number | null,
  deMinUsd: number | null,
  dutyUpper: number | null,
): VatBurdenTier | null {
  // No-data: both signals missing
  if (vatPct == null && deMinUsd == null) return null;

  // Tier A: explicit no-VAT regime (vatPct null treated as "no VAT" only when
  // de-minimis is published — otherwise it&apos;s a data-gap, handled above).
  if (vatPct === 0 || (vatPct == null && deMinUsd != null)) return 'A';
  // From here onward vatPct is non-null and Number-finite.
  if (!Number.isFinite(vatPct as number)) return null;
  const v = vatPct as number;

  // Tier E: compounding burden gate (strictest, check before D)
  if (v > 20 && dutyUpper != null && Number.isFinite(dutyUpper) && dutyUpper > 30 && deMinUsd != null && deMinUsd < 50) {
    return 'E';
  }

  // Tier D: high (>20% VAT OR <$50 de-minimis)
  if (v > 20 || (deMinUsd != null && deMinUsd < 50)) return 'D';

  // Tier B: low (<10% VAT OR ≥$800 de-minimis)
  if (v < 10 || (deMinUsd != null && deMinUsd >= 800)) return 'B';

  // Tier C: standard-EU band (10–20 VAT AND $50–$200 de-minimis)
  if (v >= 10 && v <= 20 && deMinUsd != null && deMinUsd >= 50 && deMinUsd <= 200) return 'C';

  // Fallback: VAT in 10–20 but de-minimis outside $50–$200 (e.g. > $200) →
  // still treat as Standard-EU since the headline VAT band dominates.
  if (v >= 10 && v <= 20) return 'C';

  // Anything else → conservative D
  return 'D';
}

export function classifyVatBurdenTier(opts: DecodeOpts): DecodeResult {
  const vatPct = opts.vatOrGstPct == null ? null : Number(opts.vatOrGstPct);
  const dutyRangeUpperPct = opts.dutyRangeUpperPct == null ? null : Number(opts.dutyRangeUpperPct);
  const currency = opts.currency ?? null;
  const deMinimisLocal = opts.deMinimisLocal == null ? null : Number(opts.deMinimisLocal);

  let deMinimisUsd: number | null;
  if (opts.deMinimisUsd != null && Number.isFinite(opts.deMinimisUsd)) {
    deMinimisUsd = opts.deMinimisUsd;
  } else {
    deMinimisUsd = deMinimisLocalToUsd(deMinimisLocal, currency);
  }

  const drivers: string[] = [];
  const caveats: string[] = [];

  if (vatPct == null) {
    drivers.push('No VAT/GST rate published — destination customs authority does not levy a value-added tax on imports (or the data is gapped).');
  } else if (vatPct === 0) {
    drivers.push('VAT/GST rate of 0% per published customs authority schedule.');
  } else {
    drivers.push(`Standard VAT/GST rate of ${vatPct.toFixed(1)}% per published customs authority schedule.`);
  }

  if (deMinimisUsd == null) {
    drivers.push('No de-minimis threshold available — country-published value missing or FX rate unsupported for the local currency.');
  } else if (deMinimisLocal != null && currency != null && currency.toUpperCase() !== 'USD') {
    drivers.push(`De-minimis ${deMinimisLocal} ${currency} ≈ $${deMinimisUsd.toFixed(2)} USD at the snapshot FX in de-minimis.json _meta.`);
  } else {
    drivers.push(`De-minimis $${deMinimisUsd.toFixed(2)} USD per published customs authority schedule.`);
  }

  if (dutyRangeUpperPct != null && Number.isFinite(dutyRangeUpperPct)) {
    drivers.push(`General duty range upper bound ${dutyRangeUpperPct.toFixed(1)}% per the WCO HS midpoint published for this destination.`);
  }

  const tier = classifyTier(vatPct, deMinimisUsd, dutyRangeUpperPct);

  // Universal caveats
  caveats.push('VAT/GST and de-minimis values reflect published customs schedules at the snapshot date in de-minimis.json — the destination customs authority may amend either without notice.');
  caveats.push('FX conversion uses a quarterly snapshot pinned to de-minimis.json _meta._updated; intra-quarter currency drift may shift the underlying USD threshold by a few percent.');
  caveats.push('VatBurdenTier is independent of LandedCostTier: a Tier-A landed cost (<$50) can still incur a Tier-D VAT burden on the commercial invoice value when commodity value exceeds the de-minimis.');
  caveats.push('Anti-dumping, countervailing, and excise duties (alcohol, tobacco, fuel) are not modeled — they layer on top of VAT for the relevant HS lines.');
  caveats.push('Destination-country processing fees (CBP MPF in the US, post-office handling charges in EU member states) are captured by LandedCostTier, not VatBurdenTier.');

  let confidence: DecodeResult['confidence'];
  if (tier == null) {
    confidence = 'no-data';
  } else if (vatPct != null && deMinimisUsd != null && dutyRangeUpperPct != null) {
    confidence = 'high';
  } else if (vatPct != null && deMinimisUsd != null) {
    confidence = 'moderate';
  } else {
    confidence = 'low';
  }

  return {
    tier,
    vatPct: vatPct ?? null,
    deMinimisUsd,
    deMinimisLocal,
    currency,
    dutyRangeUpperPct,
    drivers,
    caveats,
    confidence,
  };
}
