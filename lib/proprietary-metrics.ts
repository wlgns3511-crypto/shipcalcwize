import { type Country } from './db';
import { getCustomsContext } from './country-facts';
import { classifyLandedCostTier, type LandedCostTier } from './landed-cost-tier';
import { classifyVatBurdenTier, type VatBurdenTier } from './vat-burden-tier';
import { classifyTransitWindowTier, type TransitWindowTier } from './transit-window-tier';
import { interpretShipping } from './shipping-interpretation';
import countryRoutes from './generated/country-routes.json';

export interface ShippingProprietaryMetrics {
  landedCostEfficiency: number;
  customsSimplicity: number;
  transitSpeed: number;
  accessibilityGrade: string;
  commentary: string;
}

/**
 * Returns a deterministic commentary paragraph based on country name, decision framing,
 * and slug-based hash to rotate content variation and prevent duplicate content.
 */
function getDeterministicCommentary(countryName: string, decisionFraming: string, slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;

  const variations: Record<string, string[]> = {
    'compounding-burden': [
      `Shipping to ${countryName} represents a compounding burden. The combination of high landed costs, complex customs import steps, and long transit windows makes this a challenging lane that requires professional freight forwarding.`,
      `In ${countryName}, high import VAT/GST and restrictive customs duty bands create significant friction. Shippers must carefully prepare documentation to prevent lengthy customs delays and unexpected storage fees.`,
      `With low de-minimis levels and heavy duties, cargo entering ${countryName} faces high landing costs. Parcel delivery is frequently subject to additional carrier clearance fees and compliance audits.`
    ],
    'vat-stack-customs-clear': [
      `Freight rates to ${countryName} are relatively low, but the VAT/GST stack remains the dominant cost driver. Shippers should utilize pre-paid VAT schemes like IOSS where available to ensure seamless last-mile delivery.`,
      `While transit is fast and cargo costs are reasonable, ${countryName}'s import tax/VAT rules add a noticeable line item. E-commerce shippers should collect duties at checkout to avoid package abandonment.`,
      `Deductions and clearance are straightforward in ${countryName}, but the low tax threshold means almost all parcels attract VAT. Ensure correct declaration values to speed up local customs processing.`
    ],
    'marine-only-bulk-edge': [
      `Shipping to ${countryName} is dominated by the transit window. Due to geographical constraints, sea freight remains the primary volume route, meaning shippers must buffer for longer lead times while benefiting from stable port costs.`,
      `Because of ${countryName}'s location, logistics are constrained by maritime transit timelines. Shippers should prioritize bulk air cargo for urgent items, or plan marine freight well in advance.`,
      `Although customs duties in ${countryName} are moderate, transit times are exceptionally long. Optimizing shipping costs requires balancing carrier delivery schedules and maritime corridor conditions.`
    ],
    'cost-low-vat-low-fast': [
      `${countryName} is a highly efficient and clean shipping lane. Low landed costs, high de-minimis thresholds, and rapid transit times make it an ideal market for international e-commerce and express parcel delivery.`,
      `Logistics into ${countryName} are fast and cost-effective, with minimal customs intervention for typical consumer shipments. Express carriers like DHL/UPS/FedEx operate daily, high-priority routes here.`,
      `With highly favorable customs regulations and rapid carrier connections, ${countryName} represents one of the easiest destinations to ship to, yielding excellent transit times and low import friction.`
    ],
    'data-incomplete': [
      `Due to limited data availability for ${countryName}, shippers are advised to obtain custom quotes directly from international carriers to verify duties, local handling fees, and transit timelines.`,
      `Customs policy and carrier frequency for ${countryName} can vary widely. Vetting local port infrastructure and checking current fuel surcharges with a logistics provider is recommended.`,
      `Shipping baselines for ${countryName} are subject to carrier route availability. Direct inquiry with a customs broker is the best way to verify current import duty schedules and handling fees.`
    ]
  };

  const list = variations[decisionFraming] || variations['data-incomplete'];
  return list[index];
}

/**
 * Calculates shipping proprietary metrics for a given country and its tiers.
 */
export function calculateProprietaryMetrics(
  countryName: string,
  slug: string,
  landedCostTier: LandedCostTier | null,
  vatBurdenTier: VatBurdenTier | null,
  transitWindowTier: TransitWindowTier | null,
  decisionFraming: string
): ShippingProprietaryMetrics {
  const tierScores: Record<string, number> = {
    A: 95,
    B: 80,
    C: 60,
    D: 40,
    E: 20,
  };

  // 1. Landed Cost Efficiency Score (0-100)
  const landedCostEfficiency = (landedCostTier && tierScores[landedCostTier]) || 50;

  // 2. Customs Simplicity Score (0-100)
  const customsSimplicity = (vatBurdenTier && tierScores[vatBurdenTier]) || 50;

  // 3. Transit Speed Score (0-100)
  const transitSpeed = (transitWindowTier && tierScores[transitWindowTier]) || 50;

  // 4. Shipping Accessibility Grade
  const composite = 0.4 * landedCostEfficiency + 0.3 * customsSimplicity + 0.3 * transitSpeed;
  let accessibilityGrade = 'C';
  if (composite >= 90) accessibilityGrade = 'A+';
  else if (composite >= 85) accessibilityGrade = 'A';
  else if (composite >= 80) accessibilityGrade = 'A-';
  else if (composite >= 75) accessibilityGrade = 'B+';
  else if (composite >= 70) accessibilityGrade = 'B';
  else if (composite >= 65) accessibilityGrade = 'B-';
  else if (composite >= 60) accessibilityGrade = 'C+';
  else if (composite >= 55) accessibilityGrade = 'C';
  else if (composite >= 50) accessibilityGrade = 'C-';
  else if (composite >= 45) accessibilityGrade = 'D+';
  else if (composite >= 40) accessibilityGrade = 'D';
  else accessibilityGrade = 'F';

  // 5. Commentary Selection
  const commentary = getDeterministicCommentary(countryName, decisionFraming, slug);

  return {
    landedCostEfficiency,
    customsSimplicity,
    transitSpeed,
    accessibilityGrade,
    commentary,
  };
}

/**
 * High-level orchestration function to fetch and resolve all proprietary metrics for a country.
 */
export function getCountryMetrics(country: Country, slug: string): ShippingProprietaryMetrics | null {
  const customsCtx = getCustomsContext(slug);
  const dutyMidpoint = (() => {
    const range = customsCtx?.generalDutyPctRange;
    if (!range) return null;
    const nums = range.match(/[0-9]+(?:\.[0-9]+)?/g);
    if (!nums || nums.length === 0) return null;
    if (nums.length === 1) return parseFloat(nums[0]);
    const lo = parseFloat(nums[0]);
    const hi = parseFloat(nums[1]);
    return Number.isFinite(lo) && Number.isFinite(hi) ? (lo + hi) / 2 : null;
  })();

  const landedSea = classifyLandedCostTier({
    baselinePerKg: country.avg_shipping_cost_kg_sea,
    weightKg: 5,
    hsDutyPct: dutyMidpoint,
    commodityValueUsd: 200,
    processingFeeUsd: 5,
    mode: 'sea',
  });
  const landedAir = classifyLandedCostTier({
    baselinePerKg: country.avg_shipping_cost_kg_air,
    weightKg: 5,
    hsDutyPct: dutyMidpoint,
    commodityValueUsd: 200,
    processingFeeUsd: 5,
    mode: 'air',
  });

  const dutyUpper = (() => {
    const range = customsCtx?.generalDutyPctRange;
    if (!range) return null;
    const nums = range.match(/[0-9]+(?:\.[0-9]+)?/g);
    if (!nums || nums.length === 0) return null;
    return parseFloat(nums[nums.length - 1]);
  })();

  const vatBurden = classifyVatBurdenTier({
    vatOrGstPct: customsCtx?.vatPct ?? null,
    deMinimisLocal: customsCtx?.deMinimis ?? null,
    currency: customsCtx?.currency ?? null,
    dutyRangeUpperPct: dutyUpper,
  });

  type Route = { days?: number | null };
  const routes = (countryRoutes as Record<string, { fastestAir?: Route[]; cheapestSea?: Route[] }>)[slug];
  const airDaysCandidate = (() => {
    const lanes = routes?.fastestAir ?? [];
    const days = lanes.map((r) => r.days ?? null).filter((d): d is number => d != null && Number.isFinite(d) && d > 0);
    if (days.length === 0) return country.avg_transit_days_air ?? null;
    return Math.min(...days);
  })();
  const seaDaysCandidate = (() => {
    const lanes = routes?.cheapestSea ?? [];
    const days = lanes.map((r) => r.days ?? null).filter((d): d is number => d != null && Number.isFinite(d) && d > 0);
    if (days.length === 0) return country.avg_transit_days_sea ?? null;
    return Math.min(...days);
  })();

  const transitWindow = classifyTransitWindowTier({
    airDays: airDaysCandidate,
    seaDays: seaDaysCandidate,
  });

  const headlineLanded = landedSea.tier ?? landedAir.tier ?? null;
  const interpretation = interpretShipping({
    countryName: country.name,
    landedCostTier: headlineLanded,
    vatBurdenTier: vatBurden.tier,
    transitWindowTier: transitWindow.tier,
  });

  return calculateProprietaryMetrics(
    country.name,
    slug,
    headlineLanded,
    vatBurden.tier,
    transitWindow.tier,
    interpretation.decisionFraming
  );
}
