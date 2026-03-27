import type { Metadata } from "next";
import { getAllRoutes, getAllCountries } from "@/lib/db";
import { formatCost, formatDays } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";
import { webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Compare International Shipping Routes - Cost & Transit Time Comparison",
  description: "Compare shipping costs and transit times between different international routes. Side-by-side comparison of air freight, sea freight, and express courier rates.",
};

export default function ComparePage() {
  const routes = getAllRoutes();
  const countries = getAllCountries();

  // Group routes by origin
  const byOrigin: Record<string, typeof routes> = {};
  for (const r of routes) {
    if (!byOrigin[r.origin_name]) byOrigin[r.origin_name] = [];
    byOrigin[r.origin_name].push(r);
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(
        "Compare International Shipping Routes",
        "Side-by-side comparison of international shipping costs and transit times",
        "/compare"
      )) }} />

      <h1 className="text-3xl font-bold mb-3 text-amber-900">
        Compare International Shipping Routes
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Side-by-side comparison of shipping costs and transit times across {routes.length} international routes.
        Find the cheapest and fastest shipping options between countries.
      </p>

      <AdSlot id="4567890123" />

      {/* Full comparison table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">All Routes Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 font-semibold">Route</th>
                <th className="text-right px-3 py-2 font-semibold">Air $/kg</th>
                <th className="text-right px-3 py-2 font-semibold">Sea $/kg</th>
                <th className="text-right px-3 py-2 font-semibold">Express $/kg</th>
                <th className="text-right px-3 py-2 font-semibold">Air Days</th>
                <th className="text-right px-3 py-2 font-semibold">Sea Days</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const expressCost = (r.avg_cost_kg_air ?? 12) * 1.6;
                return (
                  <tr key={r.slug} className="border-b border-slate-100 hover:bg-amber-50">
                    <td className="px-3 py-2">
                      <a href={`/route/${r.slug}`} className="text-amber-700 hover:underline font-medium">
                        {r.origin_name} &rarr; {r.dest_name}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_air)}</td>
                    <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_sea)}</td>
                    <td className="px-3 py-2 text-right">{formatCost(expressCost)}</td>
                    <td className="px-3 py-2 text-right">{r.avg_days_air}</td>
                    <td className="px-3 py-2 text-right">{r.avg_days_sea}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot id="4567890124" />

      {/* Grouped by origin */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Routes by Origin Country</h2>
        <div className="space-y-8">
          {Object.entries(byOrigin).sort(([a], [b]) => a.localeCompare(b)).map(([origin, routes]) => (
            <div key={origin}>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">From {origin}</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {routes.map((r) => (
                  <a
                    key={r.slug}
                    href={`/route/${r.slug}`}
                    className="block border border-slate-200 rounded-lg p-3 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-amber-800">
                      &rarr; {r.dest_name}
                    </p>
                    <div className="mt-1 text-xs text-slate-500">
                      <span>Air: {formatCost(r.avg_cost_kg_air)}/kg ({formatDays(r.avg_days_air)})</span>
                      <span className="mx-1">&middot;</span>
                      <span>Sea: {formatCost(r.avg_cost_kg_sea)}/kg</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold mb-2">Tips for Finding Cheap International Shipping</h2>
        <ul className="text-sm text-slate-600 space-y-2">
          <li><strong>Use sea freight for heavy shipments</strong> - Ocean shipping costs 60-80% less than air freight per kg.</li>
          <li><strong>Compare multiple carriers</strong> - Rates vary significantly between DHL, FedEx, UPS, and freight forwarders.</li>
          <li><strong>Consider volumetric weight</strong> - Light but bulky items may cost more due to dimensional weight pricing.</li>
          <li><strong>Check trade agreements</strong> - FTAs can reduce or eliminate customs duties. Look up tariff rates at <a href="https://tariffpeek.com" className="text-amber-600 hover:underline">TariffPeek.com</a>.</li>
          <li><strong>Consolidate shipments</strong> - Larger volumes get better per-kg rates from carriers.</li>
        </ul>
      </section>
    </div>
  );
}
