import type { Metadata } from "next";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { AuthorBox } from "@/components/AuthorBox";
import { DATA_LAST_UPDATED } from "@/lib/data-updated";
import { ABOUT_VINTAGE } from "@/lib/authorship";
import { getAllCountries } from "@/lib/db";
import { getAllStates } from "@/lib/states-data";

export const metadata: Metadata = {
  title: "About ShipCalcWize",
  description: "Learn about ShipCalcWize, our mission, and data sources for international shipping cost data.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};

export default function AboutPage() {
  const countryCount = getAllCountries().length;
  const stateCount = getAllStates().length;

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <TrustBlock
        sources={[
          { name: 'Freightos Baltic Index', url: 'https://fbx.freightos.com/' },
          { name: 'World Bank LPI', url: 'https://lpi.worldbank.org/' },
          { name: 'UNCTAD Maritime Transport', url: 'https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport' },
          { name: 'WCO HS Codes', url: 'https://www.wcoomd.org/en/topics/nomenclature/overview.aspx' },
          { name: 'US CBP', url: 'https://www.cbp.gov/trade' },
        ]}
        updated={DATA_LAST_UPDATED}
      />

      <h1 className="text-3xl font-bold text-amber-700 mb-6">About ShipCalcWize</h1>

      <p>
        ShipCalcWize is a free resource that helps businesses, importers, exporters, and individuals compare
        international shipping costs and transit times. We make it easy to estimate freight costs for air, sea,
        and express courier services across {countryCount} countries, all in one place.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we actually have</h2>
      <p>
        We publish industry-typical baselines, not live carrier quotes. The dataset behind ShipCalcWize today is:
      </p>
      <div className="not-prose grid gap-3 sm:grid-cols-2 my-4">
        <div className="border border-slate-200 rounded-lg p-4 bg-amber-50/40">
          <p className="text-xs uppercase tracking-wider text-slate-500">Country pages</p>
          <p className="text-2xl font-bold text-amber-700">{countryCount}</p>
          <p className="text-xs text-slate-500">Origin–destination shipping baselines</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 bg-blue-50/40">
          <p className="text-xs uppercase tracking-wider text-slate-500">US state pages</p>
          <p className="text-2xl font-bold text-blue-700">{stateCount}</p>
          <p className="text-xs text-slate-500">Domestic ground-shipping aggregates</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/40">
          <p className="text-xs uppercase tracking-wider text-slate-500">Tracked carriers</p>
          <p className="text-2xl font-bold text-emerald-700">24</p>
          <p className="text-xs text-slate-500">Express, sea-freight, air-mail, freight forwarders</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <p className="text-xs uppercase tracking-wider text-slate-500">Major ports</p>
          <p className="text-2xl font-bold text-slate-700">97</p>
          <p className="text-xs text-slate-500">Air & sea ports of entry across covered countries</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        Customs and de-minimis context is documented for 30+ jurisdictions (US CBP Section 321,
        CBSA, HMRC, EU IOSS, Zoll, Douane, SAT, and more), with each country page linking out to
        the official customs authority for verification.
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
        Our shipping cost baselines lean on five authoritative data origins, all linked above in the trust
        block: Freightos Baltic Index for sea-freight container rates, the World Bank Logistics Performance
        Index for transit-time benchmarking, UNCTAD's annual Review of Maritime Transport for capacity and
        port-throughput context, the World Customs Organization for HS classification, and US Customs and
        Border Protection for Section 321 de-minimis and tariff-action context. We do not pull live rates
        from carrier APIs — see our{" "}
        <a href="/methodology/" className="text-amber-600 hover:underline">methodology page</a> for the full
        derivation.
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

      <AuthorBox
        vintage={ABOUT_VINTAGE}
        source="Editorial mission and dataset scope"
      />
    </article>
  );
}
