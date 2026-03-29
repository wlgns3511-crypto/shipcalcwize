import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllRoutes, getAllRouteSlugs, getRouteBySlug, getAllCountries, getCarriers, getCountryByCode, getRoutesByOrigin, getRoutesByDest } from "@/lib/db";
import { formatCost, formatDays, countryCodeToFlag } from "@/lib/format";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { EmbedButton } from "@/components/EmbedButton";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const routes = getAllRouteSlugs(500);
  return routes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) return {};

  return {
    title: `Shipping from ${route.origin_name} to ${route.dest_name} - Costs, Transit Times & Carriers`,
    description: `Ship from ${route.origin_name} to ${route.dest_name}: Air freight ${formatCost(route.avg_cost_kg_air)}/kg (${formatDays(route.avg_days_air)}), sea freight ${formatCost(route.avg_cost_kg_sea)}/kg (${formatDays(route.avg_days_sea)}). Compare carriers and get quotes.`,
  };
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) notFound();

  const allCountries = getAllCountries();
  const carriers = getCarriers();
  const sameOriginRoutes = getRoutesByOrigin(route.origin_code).filter(r => r.slug !== slug).slice(0, 6);
  const sameDestRoutes = getRoutesByDest(route.dest_code).filter(r => r.slug !== slug).slice(0, 6);
  const expressCarriers = carriers.filter((c) => c.type === "express");
  const seaCarriers = carriers.filter((c) => c.type === "sea");
  const airCarriers = carriers.filter((c) => c.type === "air");

  const countryOptions = allCountries.map((c) => ({ code: c.code, name: c.name }));
  const expressCost = (route.avg_cost_kg_air ?? 12) * 1.6;
  const expressDays = Math.max(1, (route.avg_days_air ?? 5) - 2);

  const faqs = [
    {
      question: `How much does it cost to ship from ${route.origin_name} to ${route.dest_name}?`,
      answer: `Air freight from ${route.origin_name} to ${route.dest_name} averages ${formatCost(route.avg_cost_kg_air)} per kg with a transit time of ${formatDays(route.avg_days_air)}. Sea freight costs about ${formatCost(route.avg_cost_kg_sea)} per kg and takes ${formatDays(route.avg_days_sea)}. Express services cost approximately ${formatCost(expressCost)} per kg with ${expressDays}-${route.avg_days_air} day delivery.`,
    },
    {
      question: `What documents are needed to ship from ${route.origin_name} to ${route.dest_name}?`,
      answer: `Typical documents include: commercial invoice, packing list, bill of lading (sea) or air waybill (air), certificate of origin, and customs declaration forms. Some goods may require additional permits, phytosanitary certificates, or product-specific documentation.`,
    },
    {
      question: `What are the customs duties for shipping from ${route.origin_name} to ${route.dest_name}?`,
      answer: route.customs_notes || `Customs duties vary by product category. Check tariffpeek.com for specific HS code rates and trade agreement benefits between ${route.origin_name} and ${route.dest_name}.`,
    },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(
        `Shipping from ${route.origin_name} to ${route.dest_name}`,
        `International shipping costs and transit times from ${route.origin_name} to ${route.dest_name}`,
        `/route/${slug}`
      )) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: route.origin_name, url: `/country/${route.origin_slug}` },
        { name: `${route.origin_name} to ${route.dest_name}`, url: `/route/${slug}` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: route.origin_name, href: `/country/${route.origin_slug}` },
        { label: `${route.origin_name} to ${route.dest_name}` },
      ]} />

      <h1 className="text-3xl font-bold mb-3 text-amber-900">
        Shipping from {route.origin_name} {countryCodeToFlag(route.origin_code)} to {route.dest_name} {countryCodeToFlag(route.dest_code)}
      </h1>
      <p className="text-lg text-slate-600 mb-6">
        Compare air freight, sea freight, and express shipping costs and transit times
        for the {route.origin_name} to {route.dest_name} route.
      </p>

      {/* Cost comparison cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h3 className="font-semibold text-amber-800 mb-2">Air Freight</h3>
          <p className="text-3xl font-bold text-amber-700">{formatCost(route.avg_cost_kg_air)}<span className="text-sm font-normal text-slate-500">/kg</span></p>
          <p className="text-sm text-slate-600 mt-1">{formatDays(route.avg_days_air)} transit</p>
          <p className="text-xs text-slate-400 mt-2">Best for: 1-500 kg, time-sensitive</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-semibold text-blue-800 mb-2">Sea Freight</h3>
          <p className="text-3xl font-bold text-blue-700">{formatCost(route.avg_cost_kg_sea)}<span className="text-sm font-normal text-slate-500">/kg</span></p>
          <p className="text-sm text-slate-600 mt-1">{formatDays(route.avg_days_sea)} transit</p>
          <p className="text-xs text-slate-400 mt-2">Best for: 500+ kg, cost-sensitive</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
          <h3 className="font-semibold text-orange-800 mb-2">Express Courier</h3>
          <p className="text-3xl font-bold text-orange-700">{formatCost(expressCost)}<span className="text-sm font-normal text-slate-500">/kg</span></p>
          <p className="text-sm text-slate-600 mt-1">{expressDays}-{route.avg_days_air} days transit</p>
          <p className="text-xs text-slate-400 mt-2">Best for: &lt;30 kg, urgent delivery</p>
        </div>
      </div>

      {/* Calculator with route defaults */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Calculate Your Shipping Cost</h2>
        <ShippingCalculator
          countries={countryOptions}
          defaultOrigin={route.origin_code}
          defaultDest={route.dest_code}
          routeAirCost={route.avg_cost_kg_air}
          routeSeaCost={route.avg_cost_kg_sea}
          routeAirDays={route.avg_days_air}
          routeSeaDays={route.avg_days_sea}
        />
      </section>

      <AdSlot id="3456789012" />

      {/* Carrier options */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Carrier Options for This Route</h2>

        <h3 className="font-semibold text-orange-700 mt-4 mb-2">Express Couriers</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {expressCarriers.slice(0, 6).map((c) => (
            <div key={c.slug} className="border border-slate-200 rounded-lg p-3 hover:border-orange-300">
              <p className="font-medium text-sm">
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">{c.name}</a>
              </p>
              <p className="text-xs text-slate-500 mt-1">{c.description}</p>
            </div>
          ))}
        </div>

        <h3 className="font-semibold text-blue-700 mt-6 mb-2">Ocean Carriers</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {seaCarriers.slice(0, 8).map((c) => (
            <div key={c.slug} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300">
              <p className="font-medium text-sm">
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{c.name}</a>
              </p>
              <p className="text-xs text-slate-500 mt-1">{c.description}</p>
            </div>
          ))}
        </div>

        {airCarriers.length > 0 && (
          <>
            <h3 className="font-semibold text-sky-700 mt-6 mb-2">Postal / Air Mail</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {airCarriers.map((c) => (
                <div key={c.slug} className="border border-slate-200 rounded-lg p-3 hover:border-sky-300">
                  <p className="font-medium text-sm">
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">{c.name}</a>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Required Documents */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Required Shipping Documents</h2>
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-amber-600 font-bold">1.</span> <strong>Commercial Invoice</strong> - Details of goods, value, buyer/seller information</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">2.</span> <strong>Packing List</strong> - Itemized list with weights and dimensions</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">3.</span> <strong>Bill of Lading / Air Waybill</strong> - Transport document from carrier</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">4.</span> <strong>Certificate of Origin</strong> - May be needed for preferential duty rates</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">5.</span> <strong>Customs Declaration</strong> - Required for all international shipments</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">6.</span> <strong>HS Code Classification</strong> - Determines duty rate. <a href="https://tariffpeek.com" className="text-amber-600 hover:underline">Look up HS codes at TariffPeek.com</a></li>
          </ul>
        </div>
      </section>

      {/* Customs notes */}
      {route.customs_notes && (
        <section className="mb-10 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Customs &amp; Import Notes</h2>
          <p className="text-sm text-slate-700">{route.customs_notes}</p>
          <p className="text-sm text-slate-600 mt-3">
            For detailed tariff rates and HS code classifications, visit{" "}
            <a href="https://tariffpeek.com" className="text-amber-600 hover:underline font-medium">TariffPeek.com</a>.
          </p>
        </section>
      )}

      <AdSlot id="3456789013" />

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-1">{faq.question}</h3>
              <p className="text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Data Resources */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Related Data Resources</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://tariffpeek.com" className="text-amber-600 hover:underline">TariffPeek - HS codes &amp; tariff rates &rarr;</a>
          <a href="https://calcpeek.com" className="text-amber-600 hover:underline">CalcPeek - Unit converters &rarr;</a>
        </div>
      </section>

      {/* Compare with other routes */}
      {(sameOriginRoutes.length > 0 || sameDestRoutes.length > 0) && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Compare Shipping Routes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sameOriginRoutes.length > 0 && (
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Other Routes from {route.origin_name}</h3>
                <div className="space-y-2">
                  {sameOriginRoutes.map((r) => {
                    const costDiff = (r.avg_cost_kg_air ?? 0) - (route.avg_cost_kg_air ?? 0);
                    return (
                      <a key={r.slug} href={`/route/${r.slug}`} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all text-sm">
                        <span className="font-medium text-amber-700">{route.origin_name} to {r.dest_name}</span>
                        <span className="text-xs text-slate-500">Air: {formatCost(r.avg_cost_kg_air)}/kg</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            {sameDestRoutes.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Other Routes to {route.dest_name}</h3>
                <div className="space-y-2">
                  {sameDestRoutes.map((r) => (
                    <a key={r.slug} href={`/route/${r.slug}`} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-sm">
                      <span className="font-medium text-blue-700">{r.origin_name} to {route.dest_name}</span>
                      <span className="text-xs text-slate-500">Air: {formatCost(r.avg_cost_kg_air)}/kg</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cross-links */}
      <div className="flex flex-wrap gap-3 text-sm mb-6">
        <a href={`/country/${route.origin_slug}`} className="text-amber-600 hover:underline">All {route.origin_name} routes</a>
        <span className="text-slate-300">|</span>
        <a href={`/country/${route.dest_slug}`} className="text-amber-600 hover:underline">All {route.dest_name} routes</a>
        <span className="text-slate-300">|</span>
        <a href="/compare" className="text-amber-600 hover:underline">Compare routes</a>
        <span className="text-slate-300">|</span>
        <a href="https://tariffpeek.com" className="text-amber-600 hover:underline">HS Codes &amp; Tariffs</a>
      </div>

      <EmbedButton
        url={`https://shipcalcwize.com/embed/shipping-calc?origin=${route.origin_code}&dest=${route.dest_code}`}
        title={`Shipping Calculator - ${route.origin_name} to ${route.dest_name}`}
        site="ShipCalcWize"
        siteUrl="https://shipcalcwize.com"
      />
      <DataFeedback />
      <FreshnessTag source="Carrier rate sheets, industry averages" />
    </div>
  );
}
