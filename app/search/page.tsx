// HCU 2026-04-25 — search results now link to destination /country/ pages
// (was /route/{slug}; /route/ subtree 410'd). The /search/ page itself is
// noindex,follow so won't be indexed; just keep it functional for users.
import type { Metadata } from "next";
import { searchRoutes, getPopularRoutes } from "@/lib/db";
import { formatCost, formatDays } from "@/lib/format";
import { CountryFlag } from "@/components/CountryFlag";

export const metadata: Metadata = {
  title: "Search Shipping Routes - ShipCalcWize",
  description: "Search international shipping routes by country. Compare air freight, sea freight, and express courier costs and transit times.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search/" },
  openGraph: { url: "/search/" },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

const POPULAR_SEARCHES = [
  "China to USA",
  "USA to UK",
  "Germany to India",
  "Japan to Australia",
  "USA to Canada",
  "China to Germany",
  "India to UAE",
  "UK to Australia",
];

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query.length >= 2 ? searchRoutes(query).slice(0, 50) : [];
  const popular = query ? [] : getPopularRoutes(12);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-900 mb-2">Search Shipping Routes</h1>
      <p className="text-slate-600 mb-6">
        Find air freight, sea freight, and express shipping costs between any two countries.
      </p>

      <form method="get" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="e.g. China, USA to Germany, Japan to UK..."
            autoFocus
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p className="text-sm text-slate-500 mb-4">
          {results.length > 0
            ? `${results.length} route${results.length !== 1 ? "s" : ""} found for "${query}"`
            : `No routes found for "${query}"`}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-3 mb-10">
          {results.map((r) => (
            <a
              key={r.slug}
              href={`/country/${r.dest_slug}/`}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 text-sm">
                  <CountryFlag code={r.origin_code} size="sm" alt={`${r.origin_name} flag`} />
                  {r.origin_name}
                  <span className="text-slate-400">→</span>
                  <CountryFlag code={r.dest_code} size="sm" alt={`${r.dest_name} flag`} />
                  {r.dest_name}
                </span>
                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                  <span>Air: {formatCost(r.avg_cost_kg_air)}/kg · {formatDays(r.avg_days_air)}</span>
                  <span>Sea: {formatCost(r.avg_cost_kg_sea)}/kg · {formatDays(r.avg_days_sea)}</span>
                </div>
              </div>
              <span className="text-xs text-amber-600 font-medium">View →</span>
            </a>
          ))}
        </div>
      )}

      {!query && popular.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Popular Shipping Routes</h2>
          <div className="space-y-3">
            {popular.map((r) => (
              <a
                key={r.slug}
                href={`/country/${r.dest_slug}/`}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 text-sm">
                    <CountryFlag code={r.origin_code} size="sm" alt={`${r.origin_name} flag`} />
                    {r.origin_name}
                    <span className="text-slate-400">→</span>
                    <CountryFlag code={r.dest_code} size="sm" alt={`${r.dest_name} flag`} />
                    {r.dest_name}
                  </span>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span>Air: {formatCost(r.avg_cost_kg_air)}/kg · {formatDays(r.avg_days_air)}</span>
                    <span>Sea: {formatCost(r.avg_cost_kg_sea)}/kg · {formatDays(r.avg_days_sea)}</span>
                  </div>
                </div>
                <span className="text-xs text-amber-600 font-medium">View →</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <a
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full hover:bg-amber-100 transition-colors"
            >
              {term}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
