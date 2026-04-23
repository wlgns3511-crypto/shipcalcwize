/**
 * Auto-generated FAQs for country shipping pages using real data values.
 */
import { formatCost, formatDays } from './format';

export interface FAQItem {
  question: string;
  answer: string;
}

interface CountryData {
  name: string;
  code: string;
  region: string;
  avg_shipping_cost_kg_air: number | null;
  avg_shipping_cost_kg_sea: number | null;
  avg_transit_days_air: number | null;
  avg_transit_days_sea: number | null;
}

interface RegionAvg {
  avgAir: number | null;
  avgSea: number | null;
}

export function generateAutoFAQs(
  country: CountryData,
  regionAvg: RegionAvg,
  seaPortCount: number,
  airPortCount: number,
): FAQItem[] {
  return [];
}
