/**
 * Shipping route insights based on carrier rate data.
 * Compares air vs sea costs, transit times, and express options
 * to help shippers pick the optimal mode.
 */

export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface RouteData {
  origin_name: string;
  dest_name: string;
  avg_cost_kg_air: number | null;
  avg_cost_kg_sea: number | null;
  avg_days_air: number | null;
  avg_days_sea: number | null;
  customs_notes: string | null;
}

export function getRouteInsights(route: RouteData): Insight[] {
  const insights: Insight[] = [];

  // 1. Air vs sea cost savings
  if (route.avg_cost_kg_air != null && route.avg_cost_kg_sea != null && route.avg_cost_kg_sea > 0) {
    const ratio = route.avg_cost_kg_air / route.avg_cost_kg_sea;
    const savings = ((route.avg_cost_kg_air - route.avg_cost_kg_sea) / route.avg_cost_kg_air) * 100;
    insights.push({
      text: `Sea freight saves ${savings.toFixed(0)}% vs air ($${route.avg_cost_kg_sea.toFixed(2)}/kg vs $${route.avg_cost_kg_air.toFixed(2)}/kg). For a 500 kg shipment, that's $${((route.avg_cost_kg_air - route.avg_cost_kg_sea) * 500).toFixed(0)} saved.`,
      sentiment: "positive",
    });
  }

  // 2. Transit time trade-off
  if (route.avg_days_air != null && route.avg_days_sea != null) {
    const daysDiff = route.avg_days_sea - route.avg_days_air;
    if (daysDiff > 20) {
      insights.push({
        text: `Sea transit takes ${daysDiff} extra days (${route.avg_days_sea} vs ${route.avg_days_air} days air). Only choose sea if your timeline allows ${route.avg_days_sea}+ days door-to-door.`,
        sentiment: "neutral",
      });
    } else if (daysDiff > 0) {
      insights.push({
        text: `Sea is ${daysDiff} days slower (${route.avg_days_sea} vs ${route.avg_days_air} days). The relatively short gap makes sea freight a strong option for this route.`,
        sentiment: "positive",
      });
    }
  }

  // 3. Express courier estimate
  if (route.avg_cost_kg_air != null && route.avg_days_air != null) {
    const expressCost = route.avg_cost_kg_air * 1.6;
    const expressDays = Math.max(1, route.avg_days_air - 2);
    insights.push({
      text: `Express courier (DHL/FedEx/UPS) estimated at ~$${expressCost.toFixed(2)}/kg with ${expressDays}-${route.avg_days_air} day delivery. Best for urgent shipments under 30 kg.`,
      sentiment: "neutral",
    });
  }

  // 4. Cost-effectiveness breakpoint
  if (route.avg_cost_kg_air != null && route.avg_cost_kg_sea != null) {
    const breakpoint = route.avg_cost_kg_air > route.avg_cost_kg_sea ? 500 : null;
    if (breakpoint) {
      insights.push({
        text: `Rule of thumb: ship by air under 500 kg for speed, by sea above 500 kg for cost. For this route, sea becomes cost-effective at roughly $${(route.avg_cost_kg_sea * 500).toFixed(0)} total.`,
        sentiment: "neutral",
      });
    }
  }

  // 5. Customs complexity
  if (route.customs_notes) {
    insights.push({
      text: `Customs note: ${route.customs_notes.substring(0, 150)}${route.customs_notes.length > 150 ? "..." : ""} Check TariffPeek for HS code-specific duty rates.`,
      sentiment: "neutral",
    });
  } else {
    insights.push({
      text: `No special customs restrictions noted for this route. Standard documentation (commercial invoice, packing list, bill of lading) should suffice.`,
      sentiment: "positive",
    });
  }

  return insights.slice(0, 5);
}
