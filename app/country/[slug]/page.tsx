import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCountries, getCountryBySlug, getRoutesByOrigin, getRoutesByDest, getPortsByCountry, getRegionAvgCost } from "@/lib/db";
import { formatCost, formatDays, countryCodeToFlag } from "@/lib/format";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";
import { InsightCards } from "@/components/InsightCards";
import { ShippingCostBar } from "@/components/ShippingCostBar";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";
import { generateAutoFAQs } from "@/lib/auto-faqs";
import { ShippingEstimator } from "@/components/tools/ShippingEstimator";
import { AnswerHero } from "@/components/upgrades/AnswerHero";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { DecisionNext } from "@/components/upgrades/DecisionNext";
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { TableOfContents } from '@/components/upgrades/TableOfContents';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

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
  const regionAvg = getRegionAvgCost(country.region);

  const countryOptions = allCountries.map((c) => ({ code: c.code, name: c.name }));

  const autoFaqs = generateAutoFAQs(country, regionAvg, seaPorts.length, airPorts.length);
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
    ...autoFaqs,
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
        { name: country.region, url: `/#${country.region.toLowerCase().replace(/ /g, "-")}/` },
        { name: country.name, url: `/country/${slug}/` },
      ])) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: country.region },
        { label: country.name },
      ]} />

      <AnswerHero
        title={`Shipping to ${country.name} ${countryCodeToFlag(country.code)}`}
        subtitle={country.region}
        tagline={`Air freight averages ${formatCost(country.avg_shipping_cost_kg_air)}/kg with ${formatDays(country.avg_transit_days_air)} transit. Sea freight is cheaper at ${formatCost(country.avg_shipping_cost_kg_sea)}/kg but takes ${formatDays(country.avg_transit_days_sea)}. Figures are industry-typical baselines \u2014 your quoted rate depends on weight, dimensions, and carrier.`}
        badges={[
          ...(country.avg_shipping_cost_kg_air && regionAvg.avgAir
            ? [
                {
                  label:
                    country.avg_shipping_cost_kg_air > regionAvg.avgAir
                      ? `Above ${country.region} avg`
                      : `Below ${country.region} avg`,
                  tone:
                    country.avg_shipping_cost_kg_air > regionAvg.avgAir
                      ? ("amber" as const)
                      : ("emerald" as const),
                },
              ]
            : []),
          { label: country.region, tone: "indigo" as const },
        ]}
        alternatives={allCountries
          .filter((c) => c.region === country.region && c.slug !== country.slug)
          .slice(0, 3)
          .map((c) => ({
            label: c.name,
            href: `/country/${c.slug}/`,
            sublabel: formatCost(c.avg_shipping_cost_kg_air) + "/kg air",
          }))}
        alternativesLabel={`Other ${country.region} destinations`}
      />

      <TrustBlock
        sources={[
          {
            name: "UNCTAD Maritime Transport",
            url: "https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport",
          },
          {
            name: "World Bank LPI",
            url: "https://lpi.worldbank.org/",
          },
          {
            name: "WCO HS Codes",
            url: "https://www.wcoomd.org/en/topics/nomenclature/overview.aspx",
          },
          {
            name: "US CBP",
            url: "https://www.cbp.gov/trade",
          },
          {
            name: "Incoterms 2020 (ICC)",
            url: "https://iccwbo.org/business-solutions/incoterms-rules/",
          },
        ]}
        updated="Latest industry baselines"
      />

      <TableOfContents />

      <InsightCards country={country} />

      <ShippingCostBar
        countryName={country.name}
        airCost={country.avg_shipping_cost_kg_air}
        seaCost={country.avg_shipping_cost_kg_sea}
        airDays={country.avg_transit_days_air}
        seaDays={country.avg_transit_days_sea}
        regionName={country.region}
        regionAvg={regionAvg}
      />

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

      {/* Why this matters — US importer / e-commerce seller context */}
      <section className="mb-8 mt-2" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why shipping to {country.name} matters
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          {(() => {
            const airCost = country.avg_shipping_cost_kg_air || 0;
            const seaCost = country.avg_shipping_cost_kg_sea || 0;
            const airDays = country.avg_transit_days_air || 0;
            const seaDays = country.avg_transit_days_sea || 0;
            const airSeaGap = airCost - seaCost;
            const airSeaMultiplier = seaCost > 0 ? airCost / seaCost : 0;
            const isUS = country.code === "US";
            const isExpensive = airCost >= 10;
            const isFast = airDays <= 3;

            const primary = isUS
              ? `Shipping into the United States is one of the most trafficked lanes in global logistics. As a US seller or importer, the big levers on your landed cost are carrier choice (USPS/UPS/FedEx/DHL each price differently by weight bracket), Section 321 de minimis eligibility for sub-$800 parcels, and whether your HS code triggers Section 301 or antidumping duties.`
              : isExpensive
              ? `${country.name} sits on the higher end of international shipping cost. At roughly ${formatCost(airCost)}/kg for air and ${formatCost(seaCost)}/kg for sea, this destination rewards consolidation: shipping multiple orders in one box, or using a freight forwarder to pool into sea LCL (less-than-container-load) cuts the per-kg cost materially.`
              : isFast
              ? `${country.name} is a fast lane for air freight at ${formatDays(airDays)} transit. For perishable, time-sensitive, or high-value goods, this destination rarely justifies the wait for sea freight unless your shipment volume is large.`
              : `${country.name} is a routine international destination with industry-typical rates. The practical decision is usually air vs sea, and that hinges almost entirely on how fast you need the goods and how heavy the shipment is.`;

            const airVsSea = airSeaMultiplier > 0
              ? `Air freight costs about ${airSeaMultiplier.toFixed(1)}x what sea freight does per kilogram, but arrives ${seaDays - airDays} days sooner. For small parcels (under ~10 kg), the time savings usually win. For anything over ~100 kg that isn't urgent, sea freight almost always wins on landed cost.`
              : null;

            const customsNote = `Duties and import taxes are separate from freight cost and can add 5\u201325% on top depending on HS code, product origin, and trade agreements. Always classify your product first, then estimate freight \u2014 not the other way around.`;

            const incotermNote = `Your Incoterm controls who pays for freight, duties, and insurance. DDP (Delivered Duty Paid) is easiest for the buyer but requires you to prepay destination customs. FOB (Free On Board) shifts freight cost to the buyer at origin port. Match the Incoterm to what you want to control.`;

            return (
              <>
                <p>{primary}</p>
                {airVsSea && <p>{airVsSea}</p>}
                <p>{customsNote}</p>
                <p className="text-sm text-slate-500">{incotermNote}</p>
              </>
            );
          })()}
        </div>
      </section>

      <ShippingEstimator
        countryName={country.name}
        avgCostKgAir={country.avg_shipping_cost_kg_air}
        avgCostKgSea={country.avg_shipping_cost_kg_sea}
        avgDeliveryDaysAir={country.avg_transit_days_air}
        avgDeliveryDaysSea={country.avg_transit_days_sea}
      />

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

      {/* DecisionNext — 3 opinionated next steps */}
      <DecisionNext
        cards={[
          {
            title: `Estimate your landed cost`,
            blurb: `Plug in weight and destination to get a full landed-cost estimate including freight and typical duties.`,
            href: `/calculator/`,
            cta: `Open calculator`,
            tone: "indigo" as const,
          },
          {
            title: `Look up tariff codes`,
            blurb: `Duties depend on your HS code. TariffPeek covers HS classifications and duty rates by country.`,
            href: `https://tariffpeek.com/country/${slug}/`,
            cta: `Check duties`,
            tone: "emerald" as const,
          },
          ...(allCountries.filter((c) => c.region === country.region && c.slug !== country.slug).slice(0, 1).map((alt) => ({
            title: `Compare with ${alt.name}`,
            blurb: `Same ${country.region} region \u2014 see which destination is faster or cheaper for your shipment.`,
            href: `/country/${alt.slug}/`,
            cta: `Compare destinations`,
            tone: "amber" as const,
          }))),
        ].slice(0, 3)}
      />

      <RelatedEntities
        entityName={country.name}
        heading={`Other ${country.region} shipping destinations`}
        statLabel="Air $/kg"
        items={allCountries
          .filter(c => c.region === country.region && c.slug !== country.slug)
          .slice(0, 8)
          .map(c => ({
            name: c.name,
            href: `/country/${c.slug}/`,
            stat: c.avg_shipping_cost_kg_air ? `${formatCost(c.avg_shipping_cost_kg_air)}/kg` : undefined,
          }))}
      />

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
      <FreshnessTag source="UNCTAD + World Bank LPI benchmarks + published carrier tariffs" />
    </div>
  );
}
