import { getAirCostRank, getDeliverySpeedRank, getRegionAvgCost, countRoutesByCountry } from "@/lib/db";
import type { Country } from "@/lib/db";

interface Props {
  country: Country;
}

export function InsightCards({ country }: Props) {
  const costRank = getAirCostRank(country.slug);
  const speedRank = getDeliverySpeedRank(country.slug);
  const regionAvg = getRegionAvgCost(country.region);
  const routeCount = countRoutesByCountry(country.code);

  const costVsRegion = country.avg_shipping_cost_kg_air != null && regionAvg.avgAir > 0
    ? Math.round(((country.avg_shipping_cost_kg_air - regionAvg.avgAir) / regionAvg.avgAir) * 100)
    : null;

  const speedTier = country.avg_transit_days_air != null
    ? country.avg_transit_days_air <= 3 ? "Express" : country.avg_transit_days_air <= 5 ? "Fast" : country.avg_transit_days_air <= 8 ? "Standard" : "Slow"
    : null;
  const speedColor = speedTier === "Express" ? "text-blue-700" : speedTier === "Fast" ? "text-blue-600" : speedTier === "Standard" ? "text-yellow-600" : "text-red-600";

  const cards: { label: string; value: string; sub: string; color: string }[] = [];

  if (costRank.rank > 0) {
    cards.push({
      label: "Cost Rank",
      value: `#${costRank.rank}`,
      sub: `of ${costRank.total} countries (cheapest)`,
      color: costRank.rank <= costRank.total * 0.33 ? "text-blue-700" : costRank.rank <= costRank.total * 0.66 ? "text-yellow-600" : "text-red-600",
    });
  }

  if (speedTier) {
    cards.push({
      label: "Delivery Speed",
      value: speedTier,
      sub: `~${country.avg_transit_days_air} days by air`,
      color: speedColor,
    });
  }

  if (costVsRegion !== null) {
    cards.push({
      label: `vs ${country.region} Avg`,
      value: `${costVsRegion > 0 ? "+" : ""}${costVsRegion}%`,
      sub: `Region avg $${regionAvg.avgAir}/kg air`,
      color: costVsRegion <= 0 ? "text-blue-700" : costVsRegion <= 20 ? "text-yellow-600" : "text-red-600",
    });
  }

  cards.push({
    label: "Active Routes",
    value: `${routeCount}`,
    sub: routeCount > 50 ? "Major shipping hub" : routeCount > 20 ? "Well-connected" : "Limited routes",
    color: "text-blue-700",
  });

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-blue-900 mb-3">Shipping Insights</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
          >
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
