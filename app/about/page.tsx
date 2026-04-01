import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ShipCalcWize",
  description: "Learn about ShipCalcWize, our mission, and data sources for international shipping cost data.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-700 mb-6">About ShipCalcWize</h1>

      <p>
        ShipCalcWize is a free resource that helps businesses, importers, exporters, and individuals compare
        international shipping costs and transit times. We make it easy to estimate freight costs for air, sea,
        and express courier services across 200+ countries, all in one place.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        International shipping costs can be opaque and confusing. Our goal is to provide transparent, accessible
        shipping cost data so everyone can make informed decisions about how to ship goods internationally.
        Whether you are an e-commerce seller shipping products globally, a business importing raw materials, or
        an individual sending a package overseas, ShipCalcWize helps you compare options.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        Our shipping cost estimates are based on published carrier rate sheets, industry averages, and freight
        market data. We aggregate rates from major carriers including FedEx, UPS, DHL, Maersk, MSC, and postal
        services. Rates are regularly reviewed and updated to reflect current market conditions.
      </p>
      <p>
        Please note that actual shipping costs may vary based on specific carrier negotiations, fuel surcharges,
        seasonal demand, and shipment characteristics. Always confirm with carriers for exact quotes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Part of DataPeek Insights Network</h2>
      <p>
        ShipCalcWize is part of the DataPeek Insights Network, a collection of free data tools including{" "}
        <a href="https://tariffpeek.com" className="text-amber-600 hover:underline">TariffPeek</a> (HS codes and tariffs),{" "}
        <a href="https://costbycity.com" className="text-amber-600 hover:underline">CostByCity</a> (cost of living), and{" "}
        <a href="https://salarybycity.com" className="text-amber-600 hover:underline">SalaryByCity</a> (wage data).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our <a href="/contact" className="text-amber-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
