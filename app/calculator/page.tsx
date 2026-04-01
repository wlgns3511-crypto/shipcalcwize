import type { Metadata } from "next";
import { getAllCountries } from "@/lib/db";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { EmbedButton } from "@/components/EmbedButton";
import { AdSlot } from "@/components/AdSlot";
import { faqSchema, webPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "International Shipping Calculator - Estimate Costs & Transit Times",
  description: "Free international shipping cost calculator. Estimate air freight, sea freight, and express courier costs with transit times for shipments worldwide.",
  alternates: { canonical: "/calculator/" },
};

export default function CalculatorPage() {
  const countries = getAllCountries();
  const countryOptions = countries.map((c) => ({ code: c.code, name: c.name }));

  const faqs = [
    { question: "How is shipping cost calculated?", answer: "Shipping cost is based on chargeable weight (the greater of actual weight or volumetric weight), shipping method (air/sea/express), origin-destination route, and carrier. Volume discounts apply for larger shipments." },
    { question: "What is volumetric weight?", answer: "Volumetric weight = Length x Width x Height (cm) / 5000 for air freight, or / 6000 for sea freight. Carriers charge based on whichever is greater: actual weight or volumetric weight." },
    { question: "Are customs duties included in the estimate?", answer: "No, this calculator estimates shipping/freight costs only. Customs duties, import taxes (VAT/GST), and brokerage fees are additional. Use tariffpeek.com to look up duty rates for your specific products." },
    { question: "How accurate are these estimates?", answer: "These estimates are based on average published carrier rates and provide a reasonable range. Actual costs may vary based on specific carrier, service level, fuel surcharges, and seasonal demand. Always get quotes from carriers for exact pricing." },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "International Shipping Cost Calculator",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "150" }
          })
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(
        "International Shipping Calculator",
        "Calculate international shipping costs for air freight, sea freight, and express courier services",
        "/calculator"
      )) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <h1 className="text-3xl font-bold mb-3 text-amber-900">
        International Shipping Cost Calculator
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Estimate shipping costs for air freight, ocean freight, and express courier services.
        Select your origin, destination, and package details to get an instant cost estimate.
      </p>

      <ShippingCalculator countries={countryOptions} />

      <AdSlot id="5678901234" />

      <section className="mt-10 mb-10">
        <h2 className="text-xl font-bold mb-3">How to Use This Calculator</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-bold text-amber-700 text-lg mb-1">1. Select Countries</p>
            <p className="text-sm text-slate-600">Choose your origin and destination countries from the dropdown menus.</p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-bold text-amber-700 text-lg mb-1">2. Enter Details</p>
            <p className="text-sm text-slate-600">Input your package weight and optionally add dimensions for volumetric weight calculation.</p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-bold text-amber-700 text-lg mb-1">3. Compare Methods</p>
            <p className="text-sm text-slate-600">Toggle between air, sea, and express to compare costs and transit times.</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Understanding Shipping Methods</h2>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800">Air Freight</h3>
            <p className="text-sm text-slate-600 mt-1">Fastest standard option. Typically 3-10 days transit. Best for shipments under 500 kg where speed matters. Costs $6-$15/kg depending on route.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800">Sea Freight (Ocean)</h3>
            <p className="text-sm text-slate-600 mt-1">Most economical for large shipments. 2-6 weeks transit. Best for 500+ kg or full containers. Costs $1.50-$5.00/kg. Available as FCL (full container) or LCL (shared container).</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800">Express Courier (DHL/FedEx/UPS)</h3>
            <p className="text-sm text-slate-600 mt-1">Fastest option with door-to-door delivery and tracking. 1-5 days transit. Best for packages under 30 kg. Premium pricing at $10-$25/kg. Includes customs brokerage.</p>
          </div>
        </div>
      </section>

      <AdSlot id="5678901235" />

      <section className="mb-10">
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

      <section className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold mb-2">Additional Costs to Consider</h2>
        <p className="text-sm text-slate-600 mb-3">
          The calculator estimates freight costs only. Your total landed cost will also include:
        </p>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li><strong>Customs duties</strong> - Based on HS code classification. <a href="https://tariffpeek.com" className="text-amber-600 hover:underline">Look up rates at TariffPeek.com</a></li>
          <li><strong>Import taxes</strong> - VAT, GST, or consumption tax depending on destination country</li>
          <li><strong>Customs brokerage fees</strong> - Typically $50-$200 for processing customs clearance</li>
          <li><strong>Insurance</strong> - Usually 0.5-2% of declared cargo value</li>
          <li><strong>Fuel surcharges</strong> - Fluctuate monthly, typically 10-25% of base rate</li>
        </ul>
      </section>

      <EmbedButton
        url="https://shipcalcwize.com/embed/shipping-calc"
        title="International Shipping Calculator"
        site="ShipCalcWize"
        siteUrl="https://shipcalcwize.com"
      />
    </div>
  );
}
