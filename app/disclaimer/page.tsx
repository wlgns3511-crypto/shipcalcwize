import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer and limitations of liability for ShipCalcWize — shipping baseline figures are industry-typical references, not live carrier quotes or customs determinations.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated:{" "}
        <time dateTime={LEGAL_VINTAGES.disclaimer}>{LEGAL_VINTAGES.disclaimer}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. ShipCalcWize is an informational reference, not a carrier or customs broker</h2>
      <p>
        ShipCalcWize publishes country-level shipping baselines, US state ground-shipping
        aggregates, harmonized-system (HS) classification context, and de-minimis customs
        notes for international commerce. Every numeric value on the site is built on
        publicly available data — primarily the Freightos Baltic Index (FBX) sea-freight
        per-kg series, the World Bank Logistics Performance Index (WB LPI) 177-country
        transit benchmark, the UNCTAD Review of Maritime Transport capacity baseline, the
        World Customs Organization (WCO) Harmonized System Nomenclature, and US Customs
        and Border Protection (CBP) Section 321 / Part 148 customs notes. The information
        on this site is for general informational and educational purposes only. While we
        strive to keep figures tied to the most recent FBX, WB LPI, UNCTAD, WCO, and CBP
        editions we cross-reference, we make no representations or warranties of any
        kind, express or implied, about the completeness, accuracy, reliability, or
        suitability of the information for any specific shipment, parcel, or commercial
        booking.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Shipping baselines ≠ live carrier quotes</h2>
      <p>
        Every shipping figure on ShipCalcWize is an industry-typical baseline derived
        from the FBX weekly index, the UNCTAD annual capacity benchmark, and the
        WB LPI country score. None of these baselines is a live carrier quote.
        The actual rate you pay depends on chargeable weight, dimensional weight
        (DIM factor), fuel surcharge, peak-season surcharge, congestion surcharge,
        general rate increase (GRI) cycles, contract discounts, account-tier
        negotiations, and last-mile zone tables — none of which are captured in
        the FBX or UNCTAD published indices. ShipCalcWize does not maintain a
        live carrier API integration with USPS, UPS, FedEx, DHL, or any ocean
        carrier — confirm every booking with the carrier or a licensed freight
        forwarder before committing capital.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Customs duty, taxes, and de-minimis are jurisdictional determinations</h2>
      <p>
        Customs duty rates published on ShipCalcWize reflect the most-favored-nation
        (MFN) rates and de-minimis thresholds as documented by the WCO Harmonized
        System Nomenclature and the US Customs and Border Protection Section 321
        Part 148 notes at the time of our last review. Customs determinations are
        made at the port of entry by the importing country&apos;s customs authority —
        not by ShipCalcWize. The WCO HS classification we display is a six-digit
        global tariff classification; the importing country&apos;s tariff schedule
        extends to eight or ten digits and may carry country-specific rate columns,
        anti-dumping duties, countervailing duties, Section 301 surtaxes, or
        product-specific quotas that ShipCalcWize does not encode. Always confirm
        the destination-country tariff line with the importing country&apos;s
        customs authority or a licensed customs broker before relying on any duty
        estimate for a commercial shipment.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Section 321 de-minimis ($800 US) and equivalent thresholds change</h2>
      <p>
        The US CBP Section 321 de-minimis threshold of $800 per shipment per day per
        consignee is documented in our de-minimis.json based on the current CBP
        guidance. Congress has actively debated lowering or restructuring Section
        321 (particularly the Type 86 entry pathway), and the threshold is subject
        to legislative change at any time. Equivalent de-minimis thresholds in
        other countries — Australia AUD 1,000, EU €150 (since IOSS), UK £135, Canada
        CAD 20/CAD 150 split, Japan ¥10,000, and dozens of others — are set by
        each country&apos;s customs authority and revised independently of US CBP.
        ShipCalcWize publishes the threshold as documented in the cited source at
        our last review vintage, but always confirm the current threshold with the
        importing country&apos;s customs authority before relying on it for a
        commercial workflow.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. LandedCostTier is a reading aid, not a binding rate</h2>
      <p>
        The LandedCostTier classifier we display is the editorial reading layer
        that combines the FBX-derived baseline shipping cost with the WCO HS
        duty percentage and the CBP processing fee. It exists to help readers
        understand why two superficially similar shipments can land in very
        different cost bands once duty and customs fees are layered in. It is
        <strong> not</strong> a substitute for a freight forwarder&apos;s quote
        or a customs broker&apos;s landed-cost computation. The following are
        <em> not</em> included in the LandedCostTier reading and can materially
        change the actual landed cost of your shipment:
      </p>
      <ul>
        <li>
          <strong>Fuel surcharge and peak-season indices.</strong> The FBX weekly
          index reflects spot capacity, not the bunker adjustment factor (BAF),
          emergency bunker surcharge (EBS), or peak-season surcharge applied at
          booking.
        </li>
        <li>
          <strong>Last-mile zone tables.</strong> WB LPI scores aggregate national
          logistics performance, not the in-country zone-to-zone last-mile rate
          tables that USPS, UPS, FedEx, and DHL publish for each destination.
        </li>
        <li>
          <strong>Anti-dumping, countervailing, and Section 301 duties.</strong>{" "}
          WCO HS classification is six-digit; product-specific anti-dumping or
          Section 301 surtaxes are layered on the country&apos;s ten-digit
          tariff line and not captured in our base HS duty figure.
        </li>
        <li>
          <strong>Insurance, brokerage, demurrage, and detention.</strong> The
          UNCTAD baseline reflects capacity, not the cargo-insurance, broker,
          and port-detention costs that accumulate at clearance.
        </li>
        <li>
          <strong>Currency conversion and payment processing.</strong> Cross-border
          shipments incur FX spread and payment-processor fees that ShipCalcWize
          does not capture.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. WB LPI transit-day caveat</h2>
      <p>
        Transit-day figures on country pages are calibrated from the World Bank
        Logistics Performance Index — the most authoritative 177-country logistics
        benchmark published. The WB LPI is published every two to three years, not
        weekly. The transit-day baselines we display therefore reflect typical
        sea or air transit conditions at the most recent WB LPI edition, not
        live carrier transit-time guarantees. Actual transit time on any
        specific booking is determined by sailing schedules, port congestion
        (which the UNCTAD Maritime Review documents at the macro level but not
        per-sailing), customs clearance time at the destination, and last-mile
        delivery — all of which can swing transit by days or weeks.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Data accuracy and vintage</h2>
      <p>
        Data displayed on ShipCalcWize is sourced from FBX (weekly index, last
        reviewed at the date stamped on each page), WB LPI (most recent triennial
        edition), UNCTAD (most recent Annual Review of Maritime Transport),
        the WCO 2022 HS Nomenclature edition, and the CBP Section 321 Part 148
        guidance at the date of our last review. While we make reasonable efforts
        to refresh on each FBX cycle and to re-cross-reference WB LPI and UNCTAD
        editions as they publish, data may contain transcription errors, be
        outdated relative to a customs authority notice issued after our last
        review, or have known source-side limitations (notably WB LPI&apos;s
        triennial cadence). Users should independently verify critical
        information against the authoritative source — fbx.freightos.com, the
        WB LPI portal, unctad.org, wcoomd.org, or cbp.gov — before making any
        commercial decision with money on the line.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Not professional advice</h2>
      <p>
        Nothing on ShipCalcWize constitutes professional advice of any kind,
        including but not limited to customs, trade-compliance, tax, legal,
        financial, freight-forwarding, or commercial advice. Any reliance you
        place on the FBX-derived baselines, the WB LPI transit estimates, the
        UNCTAD capacity context, the WCO HS classifications, the CBP Section
        321 de-minimis notes, or the LandedCostTier reading is strictly at your
        own risk. Before relying on any figure for a purchase, sale, customs
        entry, import declaration, or commercial booking, consult a licensed
        customs broker, a freight forwarder, a trade-compliance professional,
        or the destination-country customs authority directly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Disclosure: operator location</h2>
      <p>
        ShipCalcWize is operated outside the United States. The CBP Section 321
        de-minimis guidance we relay, the WCO HS Nomenclature we encode, the
        FBX index we cross-reference, the WB LPI score we display, and the
        UNCTAD Maritime Transport baseline we cite are all published by the
        named authority. The site does not represent readers before US CBP,
        before any foreign customs authority, before the US Department of
        Commerce, or before the WCO, and operates as a data-relay reference
        only. The site does not provide customs entry, classification rulings,
        or broker services.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. External links</h2>
      <p>
        This website contains links to external websites — including FBX
        (fbx.freightos.com), the WB LPI portal (lpi.worldbank.org), UNCTAD
        (unctad.org), the WCO (wcoomd.org), US CBP (cbp.gov), and others —
        that are not under our control. We provide these links so readers
        can verify the underlying data and consult the authoritative source,
        but we have no responsibility for the content, privacy policies, or
        practices of any third-party site.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Advertising</h2>
      <p>
        ShipCalcWize displays third-party advertisements through Google
        AdSense and other ad networks. These advertisements are provided by
        third parties and do not imply endorsement by ShipCalcWize. We are
        not responsible for the content or accuracy of any advertisements
        displayed on this website, nor do advertisers influence how the FBX,
        WB LPI, UNCTAD, WCO, or CBP data is presented or how the
        LandedCostTier editorial layer is computed.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">12. Limitation of liability</h2>
      <p>
        In no event shall ShipCalcWize, its owners, operators, or contributors
        be liable for any direct, indirect, incidental, consequential, or
        punitive damages arising from the use of this website or the FBX-
        derived baselines, WB LPI transit estimates, WCO HS classifications,
        CBP de-minimis notes, or LandedCostTier readings contained herein.
        This includes, without limitation, losses arising from over- or
        under-payment of customs duty, missed CBP entry filings, miscalculated
        landed cost, demurrage, detention, cargo loss, cargo damage, refused
        deliveries, returned shipments, or any other commercial decision made
        in reliance on this site. Customs determinations are between you,
        your freight forwarder, your customs broker, and the destination
        country&apos;s customs authority.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">13. Contact</h2>
      <p>
        If you have concerns about any content on this website, or if you
        have identified a discrepancy between a figure on this site and the
        authoritative FBX, WB LPI, UNCTAD, WCO, or CBP release, please visit
        our{" "}
        <a href="/contact" className="text-amber-700 hover:underline">contact page</a>{" "}
        and we will route the question to the editorial team.
      </p>

      <AuthorBox />
    </article>
  );
}
