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
        ShipCalcWize is a data-relay reference for international shipping, anchored
        in five published authorities: the Freightos Baltic Index (FBX) weekly
        sea-freight index, the World Bank Logistics Performance Index (WB LPI)
        triennial 177-country logistics benchmark, the UNCTAD Review of Maritime
        Transport annual capacity baseline, the World Customs Organization (WCO)
        Harmonized System Nomenclature, and US Customs and Border Protection (CBP)
        Section 321 / 19 CFR Part 148 customs guidance. We make it easy for
        importers, e-commerce sellers, freight desks, and individual senders to
        cross-reference shipping baselines, customs de-minimis thresholds, and
        HS classification context across {countryCount} countries in one place —
        every number traceable back to the FBX, WB LPI, UNCTAD, WCO, or CBP
        release that produced it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we actually have</h2>
      <p>
        We publish industry-typical baselines built on the FBX sea-freight index,
        the WB LPI transit calibration, and the UNCTAD capacity context — not
        live rates pulled from a carrier API. The customs context layered atop
        each country page is drawn directly from the WCO HS Nomenclature and,
        for US-inbound shipments, the CBP Section 321 guidance. The dataset
        behind ShipCalcWize today is:
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
        Customs and de-minimis context is documented for 30+ jurisdictions
        (US CBP Section 321 / Part 148, CBSA, HMRC, EU IOSS, Zoll, Douane,
        SAT, and more), with each country page linking out to the official
        customs authority for verification. The WCO HS Nomenclature spine
        underpinning every duty figure is the same six-digit classification
        used by 200+ customs authorities worldwide.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        International shipping costs can be opaque, scattered across FBX weekly
        bulletins, WB LPI triennial reports, UNCTAD annual reviews, WCO HS
        Nomenclature updates, and CBP Federal Register notices. Our goal is to
        relay that source material in one place, with the originating authority
        cited at the page level, so importers, exporters, e-commerce sellers,
        freight desks, and individual senders can make informed decisions
        anchored in published data — not in opaque carrier quotes. Whether you
        are a seller shipping internationally, a business importing raw
        materials, or an individual sending a parcel overseas, ShipCalcWize
        compares options against the FBX, WB LPI, UNCTAD, WCO, and CBP
        baselines.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        Our shipping cost baselines lean on five authoritative data origins,
        all linked above in the trust block. The Freightos Baltic Index is the
        industry-standard spot-rate benchmark for container sea-freight per-kg
        and the calibration anchor for our country-level shipping baselines.
        The World Bank Logistics Performance Index scores all 177 countries on
        customs efficiency, infrastructure quality, ease of arranging shipments,
        logistics competence, tracking & tracing, and timeliness — we use the
        WB LPI score to calibrate transit-day baselines on every country page.
        The UNCTAD Review of Maritime Transport is the annual UN-published
        review of global fleet capacity, port throughput, and structural trends
        in maritime shipping that calibrates our country baselines against
        world capacity supply. The World Customs Organization Harmonized System
        Nomenclature is the six-digit global tariff classification standard
        used by 200+ customs authorities; we encode 1,686 HS lines as the
        classification spine for our duty context. US Customs and Border
        Protection publishes the Section 321 / 19 CFR Part 148 guidance that
        governs the $800 de-minimis threshold and the Type 86 entry pathway —
        our de-minimis.json documents the US Section 321 baseline plus 30
        cross-referenced country thresholds drawn from each country&apos;s
        customs authority.
      </p>
      <p>
        We do not pull live rates from carrier APIs — see our{" "}
        <a href="/methodology/" className="text-amber-600 hover:underline">methodology page</a> for the full
        FBX, WB LPI, UNCTAD, WCO, and CBP derivation chain.
      </p>
      <p>
        Please note that actual shipping costs may vary based on specific
        carrier negotiations, fuel surcharges, seasonal demand, and shipment
        characteristics — none of which the FBX index, WB LPI score, or UNCTAD
        capacity figure capture at the booking level. Customs duty rates are
        most-favored-nation rates from the WCO HS Nomenclature plus the
        CBP-published de-minimis carve-out where applicable; the destination
        country&apos;s eight- or ten-digit tariff line may carry anti-dumping
        duties, Section 301 surtaxes, or countervailing duties that ShipCalcWize
        does not encode. Always confirm with carriers, the WCO HS schedule
        for the importing country, the CBP Section 321 guidance for US-inbound
        consignments, and the destination country&apos;s customs authority for
        exact quotes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial reading layers built on the FBX / WB LPI / UNCTAD / WCO / CBP releases</h2>
      <p>
        Three editorial reading layers sit atop the five authoritative releases.
        The LandedCostTier classifier combines the FBX-derived shipping baseline,
        the WCO HS duty percentage, and the CBP processing fee (or the
        destination country&apos;s equivalent) into a 5-band reader (A&lt;$50 /
        B$50–200 / C$200–500 / D$500–1500 / E≥$1500). The VatBurdenTier
        classifier composes destination VAT/GST × the CBP-equivalent de-minimis
        threshold × the WCO HS duty upper bound into a 5-band reader from
        zero-VAT (A) through compounding-burden (E). The TransitWindowTier
        classifier reads the air and sea transit days documented per country
        (calibrated to WB LPI and UNCTAD capacity context) into a 5-band reader
        from same-week air (A) through restricted-routing (E). All three
        readers are deterministic editorial classifiers — not endorsements by
        FBX, the World Bank, UNCTAD, the WCO, or CBP.
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
