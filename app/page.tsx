import type { Metadata } from "next";
import { getAllCountries, getPopularRoutes, getCarriers, getCountriesByRegion } from "@/lib/db";
import { formatCost, formatDays } from "@/lib/format";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { AdSlot } from "@/components/AdSlot";
import { datasetSchema, faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const countries = getAllCountries();
  const popularRoutes = getPopularRoutes(16);
  const carriers = getCarriers();
  const regions = getCountriesByRegion();

  const countryOptions = countries.map((c) => ({ code: c.code, name: c.name }));

  const faqs = [
    { question: "What is the cheapest way to ship internationally?", answer: "Sea freight (ocean shipping) is typically the cheapest option for international shipping, costing $1.50-$5.00 per kg. However, it takes 2-6 weeks. For smaller packages, postal services like USPS International or China Post offer affordable air mail options." },
    { question: "How much does it cost to ship 10 kg internationally?", answer: "The cost to ship 10 kg internationally varies by route and method. Air freight averages $60-$150, express courier (DHL/FedEx/UPS) costs $100-$250, and sea freight costs $15-$50. Routes from China are generally cheaper than from the US or Europe." },
    { question: "How long does international shipping take?", answer: "Express shipping takes 2-5 days, air freight takes 3-10 days, and sea freight takes 2-6 weeks depending on the route. US to Europe air freight averages 5 days; China to US sea freight averages 30 days." },
    { question: "What is volumetric weight in shipping?", answer: "Volumetric (dimensional) weight is calculated by multiplying Length x Width x Height (in cm) and dividing by 5000 for air freight or 6000 for sea freight. Carriers charge based on the greater of actual weight or volumetric weight." },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(
        "International Shipping Cost Data",
        "Comprehensive shipping cost and transit time data for international routes, covering air freight, sea freight, and express courier services."
      )) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-3 text-amber-900">
          International Shipping Cost Calculator &amp; Comparison
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Compare shipping costs, transit times, and carriers for international shipments.
          Calculate air freight, ocean freight, and express delivery rates for {countries.length}+ countries.
        </p>
      </section>

      <section className="mb-12">
        <ShippingCalculator countries={countryOptions} />
      </section>

      <AdSlot id="1234567890" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Popular Shipping Routes</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {popularRoutes.map((route) => (
            <a
              key={route.slug}
              href={`/route/${route.slug}`}
              className="block border border-slate-200 rounded-lg p-3 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <p className="font-semibold text-sm text-amber-800">
                {route.origin_name} &rarr; {route.dest_name}
              </p>
              <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                <p>Air: {formatCost(route.avg_cost_kg_air)}/kg &middot; {formatDays(route.avg_days_air)}</p>
                <p>Sea: {formatCost(route.avg_cost_kg_sea)}/kg &middot; {formatDays(route.avg_days_sea)}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Carrier Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 font-semibold">Carrier</th>
                <th className="text-left px-3 py-2 font-semibold">Type</th>
                <th className="text-left px-3 py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {carriers.slice(0, 12).map((carrier) => (
                <tr key={carrier.slug} className="border-b border-slate-100 hover:bg-amber-50">
                  <td className="px-3 py-2 font-medium">
                    <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">
                      {carrier.name}
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      carrier.type === "express" ? "bg-orange-100 text-orange-700" :
                      carrier.type === "sea" ? "bg-blue-100 text-blue-700" :
                      "bg-sky-100 text-sky-700"
                    }`}>
                      {carrier.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{carrier.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot id="1234567891" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Browse Countries by Region</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(regions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([region, countries]) => (
              <div key={region} className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-700 mb-2">{region} ({countries.length})</h3>
                <ul className="space-y-1 text-sm">
                  {countries.slice(0, 8).map((c) => (
                    <li key={c.code}>
                      <a
                        href={`/country/${c.slug}`}
                        className="text-slate-600 hover:text-amber-600 hover:underline"
                      >
                        {c.name}
                      </a>
                      <span className="text-slate-400 ml-1 text-xs">
                        Air {formatCost(c.avg_shipping_cost_kg_air)}/kg
                      </span>
                    </li>
                  ))}
                  {countries.length > 8 && (
                    <li className="text-slate-400 text-xs">
                      +{countries.length - 8} more countries
                    </li>
                  )}
                </ul>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">{faq.question}</h3>
              <p className="text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold mb-2">Related Resources</h2>
        <p className="text-sm text-slate-600">
          Need to look up tariff codes for your shipment? Visit <a href="https://tariffpeek.com" className="text-amber-600 hover:underline font-medium">TariffPeek.com</a> for
          HS code lookup and tariff classification. Planning a move? Check <a href="https://costbycity.com" className="text-amber-600 hover:underline font-medium">CostByCity.com</a> for
          cost of living data at your destination.
        </p>
      </section>
    </div>
  );
}
