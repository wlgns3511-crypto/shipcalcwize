import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCountries, getCountryBySlug, getRoutesByOrigin, getRoutesByDest, getPortsByCountry } from "@/lib/db";
import { formatCost, formatDays, countryCodeToFlag } from "@/lib/format";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";
import { InsightCards } from "@/components/InsightCards";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const countries = getAllCountries();
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return {};

  return {
    title: `Shipping to ${country.name} - International Shipping Costs & Transit Times`,
    description: `Compare shipping costs to ${country.name}. Air freight from ${formatCost(country.avg_shipping_cost_kg_air)}/kg, sea freight from ${formatCost(country.avg_shipping_cost_kg_sea)}/kg. Transit times, carriers, customs info.`,
    alternates: { canonical: `/country/${slug}/` },
    openGraph: { url: `/country/${slug}/` },
  };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const allCountries = getAllCountries();
  const routesFrom = getRoutesByOrigin(country.code);
  const routesTo = getRoutesByDest(country.code);
  const ports = getPortsByCountry(country.code);
  const seaPorts = ports.filter((p) => p.port_type === "sea");
  const airPorts = ports.filter((p) => p.port_type === "air");

  const countryOptions = allCountries.map((c) => ({ code: c.code, name: c.name }));

  const faqs = [
    {
      question: `How much does it cost to ship to ${country.name}?`,
      answer: `Average air freight to ${country.name} costs around ${formatCost(country.avg_shipping_cost_kg_air)} per kg, and sea freight costs about ${formatCost(country.avg_shipping_cost_kg_sea)} per kg. Express services (DHL/FedEx/UPS) typically cost 50-80% more than standard air freight.`,
    },
    {
      question: `How long does shipping to ${country.name} take?`,
      answer: `Air freight to ${country.name} takes approximately ${formatDays(country.avg_transit_days_air)}, while sea freight takes about ${formatDays(country.avg_transit_days_sea)}. Express courier services can deliver in ${Math.max(1, (country.avg_transit_days_air ?? 5) - 2)}-${country.avg_transit_days_air} days.`,
    },
    {
      question: `What are the customs duties for shipping to ${country.name}?`,
      answer: `Customs duties for ${country.name} vary by product category and value. Check tariff classifications at tariffpeek.com for specific HS codes and duty rates. Import taxes and VAT may also apply.`,
    },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(
        `Shipping to ${country.name}`,
        `International shipping costs and transit times for ${country.name}`,
        `/country/${slug}`
      )) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: country.region, url: `/#${country.region.toLowerCase().replace(/ /g, "-")}` },
        { name: country.name, url: `/country/${slug}` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: country.region },
        { label: country.name },
      ]} />

      <h1 className="text-3xl font-bold mb-3 text-amber-900">
        Shipping to {country.name} {countryCodeToFlag(country.code)}
      </h1>
      <p className="text-lg text-slate-600 mb-6">
        International shipping costs, transit times, and carrier options for {country.name} ({country.region}).
      </p>

      <InsightCards country={country} />

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Air Freight</p>
          <p className="text-2xl font-bold text-amber-700">{formatCost(country.avg_shipping_cost_kg_air)}</p>
          <p className="text-xs text-slate-500">per kg</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Sea Freight</p>
          <p className="text-2xl font-bold text-blue-700">{formatCost(country.avg_shipping_cost_kg_sea)}</p>
          <p className="text-xs text-slate-500">per kg</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Air Transit</p>
          <p className="text-2xl font-bold text-amber-700">{formatDays(country.avg_transit_days_air)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Sea Transit</p>
          <p className="text-2xl font-bold text-blue-700">{formatDays(country.avg_transit_days_sea)}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Calculate Shipping to {country.name}</h2>
        <ShippingCalculator countries={countryOptions} defaultDest={country.code} />
      </section>

      <AdSlot id="2345678901" />

      {/* Routes FROM this country */}
      {routesFrom.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Shipping Routes from {country.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 font-semibold">Destination</th>
                  <th className="text-right px-3 py-2 font-semibold">Air $/kg</th>
                  <th className="text-right px-3 py-2 font-semibold">Sea $/kg</th>
                  <th className="text-right px-3 py-2 font-semibold">Air Days</th>
                  <th className="text-right px-3 py-2 font-semibold">Sea Days</th>
                </tr>
              </thead>
              <tbody>
                {routesFrom.map((r) => (
                  <tr key={r.slug} className="border-b border-slate-100 hover:bg-amber-50">
                    <td className="px-3 py-2">
                      <a href={`/route/${r.slug}`} className="text-amber-700 hover:underline font-medium">{r.dest_name}</a>
                    </td>
                    <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_air)}</td>
                    <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_sea)}</td>
                    <td className="px-3 py-2 text-right">{r.avg_days_air}</td>
                    <td className="px-3 py-2 text-right">{r.avg_days_sea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Routes TO this country */}
      {routesTo.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Shipping Routes to {country.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 font-semibold">Origin</th>
                  <th className="text-right px-3 py-2 font-semibold">Air $/kg</th>
                  <th className="text-right px-3 py-2 font-semibold">Sea $/kg</th>
                  <th className="text-right px-3 py-2 font-semibold">Air Days</th>
                  <th className="text-right px-3 py-2 font-semibold">Sea Days</th>
                </tr>
              </thead>
              <tbody>
                {routesTo.map((r) => (
                  <tr key={r.slug} className="border-b border-slate-100 hover:bg-amber-50">
                    <td className="px-3 py-2">
                      <a href={`/route/${r.slug}`} className="text-amber-700 hover:underline font-medium">{r.origin_name}</a>
                    </td>
                    <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_air)}</td>
                    <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_sea)}</td>
                    <td className="px-3 py-2 text-right">{r.avg_days_air}</td>
                    <td className="px-3 py-2 text-right">{r.avg_days_sea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Ports */}
      {ports.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Ports &amp; Airports in {country.name}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {seaPorts.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-700 mb-2">Sea Ports</h3>
                <ul className="space-y-1 text-sm">
                  {seaPorts.map((p) => (
                    <li key={p.slug} className="text-slate-600">{p.port_name}</li>
                  ))}
                </ul>
              </div>
            )}
            {airPorts.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-700 mb-2">Air Freight Airports</h3>
                <ul className="space-y-1 text-sm">
                  {airPorts.map((p) => (
                    <li key={p.slug} className="text-slate-600">{p.port_name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <AdSlot id="2345678902" />

      {/* Customs info with tariffpeek cross-link */}
      <section className="mb-10 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold mb-2">Customs &amp; Import Duties for {country.name}</h2>
        <p className="text-sm text-slate-600 mb-3">
          Import duties and taxes for {country.name} vary by product category, value, and origin country.
          Most goods are classified using HS (Harmonized System) codes which determine the applicable duty rate.
        </p>
        <p className="text-sm text-slate-600">
          Look up tariff codes and duty rates for your specific products at{" "}
          <a href="https://tariffpeek.com" className="text-amber-600 hover:underline font-medium">TariffPeek.com</a>.
          Understanding the correct HS code classification can help you estimate total landed costs including
          customs duties, VAT/GST, and any special taxes.
        </p>
      </section>

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

      <DataFeedback />
      <FreshnessTag source="Carrier rate sheets, industry averages" />
    </div>
  );
}
