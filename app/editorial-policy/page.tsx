import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How ShipCalcWize sources, reviews, and labels its FBX, WB LPI, UNCTAD, WCO HS, and CBP-derived shipping and customs data — and the explicit boundary between authoritative releases and our editorial readings.",
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { url: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <h1>Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated:{" "}
        <time dateTime={LEGAL_VINTAGES.editorialPolicy}>{LEGAL_VINTAGES.editorialPolicy}</time>
      </p>
      <p className="lead">
        ShipCalcWize publishes country-level shipping baselines, US state ground
        aggregates, and customs context anchored in five authoritative releases:
        the Freightos Baltic Index (FBX), the World Bank Logistics Performance
        Index (WB LPI), the UNCTAD Review of Maritime Transport, the World
        Customs Organization (WCO) Harmonized System Nomenclature, and US Customs
        and Border Protection (CBP) Section 321 / Part 148 guidance. This page
        documents which releases we ingest, which authorities we treat as
        cross-references, where our editorial readings begin, and where they end.
      </p>

      <h2>1. Editorial team scope</h2>
      <p>
        ShipCalcWize is published by an editorial team that relays the FBX,
        WB LPI, UNCTAD, WCO HS, and CBP source releases as its primary
        contribution; the work is data relay and editorial reading layered
        on top of authoritative published material. The editorial team is
        responsible for: (a) ingesting each weekly FBX index publication on
        its release cadence;
        (b) reconciling country baselines against the WB LPI score on each
        triennial WB LPI edition; (c) refreshing the UNCTAD Maritime Transport
        capacity context on each annual UNCTAD edition; (d) reviewing the WCO
        HS Nomenclature classification on each WCO release cycle; (e)
        re-cross-referencing CBP Section 321 / Part 148 guidance whenever CBP
        issues a Federal Register notice that affects de-minimis or commercial
        entry; and (f) maintaining the LandedCostTier and DeMinimisDecoder
        editorial layers so readers can see which release vintage each page
        reflects.
      </p>

      <h2>2. Primary data sources (authoritative — backed by our database)</h2>
      <p>
        Five upstream authorities back every numeric value on the site. These
        are the only authorities we list as <code>sourceOrganization</code> in
        schema.org metadata, because every number we publish can be traced to
        one of them:
      </p>
      <ul>
        <li>
          <strong>Freightos Baltic Index (FBX).</strong> Weekly published
          container-shipping per-kg index. We use the FBX twelve-route global
          composite and the major-lane sub-indices as the calibration baseline
          for our country-level sea-freight per-kg figure. The FBX is the
          industry-standard spot-rate benchmark cited by maritime trade
          publications and central-bank trade analyses; the index publication
          cadence and methodology are documented at fbx.freightos.com.
        </li>
        <li>
          <strong>World Bank — Logistics Performance Index (WB LPI).</strong>{" "}
          The WB LPI is the authoritative 177-country logistics benchmark,
          scoring each country on customs efficiency, infrastructure quality,
          ease of arranging shipments, logistics competence, tracking &
          tracing, and timeliness. We use the WB LPI score to adjust the
          country-level transit-day baseline displayed on every country page.
          WB LPI is published every two to three years; our pages reflect
          the most recent edition.
        </li>
        <li>
          <strong>UNCTAD — Review of Maritime Transport.</strong> Annual
          publication from the United Nations Conference on Trade and
          Development covering global merchant fleet capacity, port
          throughput, and structural trends in maritime shipping. We use
          UNCTAD as the macro-capacity baseline that calibrates our country
          shipping volumes against world fleet supply for the matching year.
        </li>
        <li>
          <strong>World Customs Organization (WCO) — Harmonized System
          Nomenclature.</strong> The WCO HS Nomenclature (2022 Edition) is
          the global six-digit tariff classification standard used by 200+
          customs authorities. We use the WCO HS Nomenclature as the
          classification spine for our HS-duty context (1,686-line JSON);
          country-specific tariff lines extend to eight or ten digits and
          are referenced separately on individual country pages.
        </li>
        <li>
          <strong>US Customs and Border Protection (CBP).</strong> CBP
          Section 321 / 19 CFR Part 148 governs the US $800 de-minimis
          threshold and the Type 86 entry pathway. We use CBP-published
          guidance as the legal authority for our de-minimis.json (which
          covers the US Section 321 threshold plus 30 cross-referenced
          country de-minimis thresholds documented by each country&apos;s
          customs authority).
        </li>
      </ul>

      <h2>3. Cross-reference resources (body text only — not schema-level providers)</h2>
      <p>
        Several authorities appear in body trust blocks across the site, but
        we do not list them as schema-level data providers because they do
        not back individual numbers on individual pages:
      </p>
      <ul>
        <li>
          <strong>Carrier rate sheets (USPS IMM, UPS Worldwide, FedEx
          International, DHL Express, IATA Air Cargo Tariff).</strong> These
          are the operational rate authorities for individual bookings, but
          ShipCalcWize does not maintain a live carrier API integration —
          the FBX-, WB LPI-, and UNCTAD-derived figures on the site are
          industry-typical baselines, not pulled from a carrier API. We
          reference carrier publications when readers need a verification
          path for an individual quote.
        </li>
        <li>
          <strong>National customs authorities outside the US.</strong> The
          CBP-published Section 321 threshold is one of approximately 30
          de-minimis thresholds captured in our de-minimis.json. The
          equivalent thresholds in Australia (Australian Border Force),
          Canada (CBSA), Japan (Japan Customs), the UK (HMRC), and the EU
          (European Commission DG TAXUD) are encoded from each authority&apos;s
          published guidance and reviewed when each authority issues a
          revised notice.
        </li>
        <li>
          <strong>WTO Tariff Database and WTO Trade Profiles.</strong> The
          World Trade Organization publishes consolidated tariff data drawn
          from member-state submissions. We reference WTO publications when
          readers need a cross-source check on a most-favored-nation tariff
          rate already documented in the WCO HS schedule.
        </li>
      </ul>

      <h2>4. LandedCostTier computation methodology</h2>
      <p>
        The LandedCostTier displayed on each country page is computed from
        three deterministic inputs: (a) the FBX-derived shipping baseline
        scaled to the reference weight, (b) the WCO HS duty percentage for
        the reference HS-classification line at the destination country, and
        (c) the CBP processing fee (or the destination country&apos;s
        equivalent processing fee where documented). The classifier produces
        five tiers (A through E) using fixed dollar cutoffs that are
        documented on the methodology page. The classifier is deterministic
        — given the same FBX baseline, WCO HS duty, and CBP fee inputs, the
        tier output is reproducible. The classifier is an editorial reading
        layer, not a quote.
      </p>

      <h2>5. LandedCostTier is an editorial reading layer</h2>
      <p>
        The LandedCostTier classifier is an editorial heuristic. It is not
        endorsed by the Freightos Baltic Index, the World Bank, UNCTAD, the
        WCO, or US CBP. It is a ShipCalcWize editorial framing tool —
        readers must treat it as a starting point for inquiry, not as a
        certified landed-cost computation. Live landed cost on any specific
        shipment requires a freight forwarder&apos;s quote, a customs
        broker&apos;s entry preparation, and the destination country&apos;s
        actual tariff line for the ten-digit HTS code applicable to the
        commodity.
      </p>

      <h2>6. DeMinimisDecoder is an editorial classifier</h2>
      <p>
        The DeMinimisDecoder tier shown for each country is built from the
        published de-minimis threshold in that country&apos;s customs
        authority materials and cross-checked against the CBP Section 321
        guidance for the US baseline. The Decoder encodes (a) the
        per-shipment threshold in local currency and USD equivalent, (b)
        the consignee restrictions where applicable, (c) the commodity
        carve-outs (alcohol, tobacco, controlled goods), and (d) the
        documentation pathway. The Decoder is updated when the relevant
        customs authority issues a revised notice. The Decoder does not
        certify your individual shipment&apos;s eligibility — the
        destination country&apos;s customs officer at the port of entry
        does that.
      </p>

      <h2>7. Verification chain</h2>
      <p>
        Every numeric value on ShipCalcWize can be traced to a published
        source. Readers who need to verify a country or state figure for a
        commercial decision should: (a) start at fbx.freightos.com to
        cross-check the spot-rate baseline; (b) consult the WB LPI portal
        at lpi.worldbank.org for the country-level logistics score; (c)
        cross-check the UNCTAD Annual Review of Maritime Transport for the
        capacity context; (d) consult the WCO HS Nomenclature at
        wcoomd.org for the six-digit classification of the commodity in
        question; (e) consult the CBP Section 321 guidance at cbp.gov or
        the destination country&apos;s customs authority for the
        de-minimis threshold; and (f) request a quote from a freight
        forwarder or customs broker for the actual booking.
      </p>

      <h2>8. Vintage labeling</h2>
      <p>
        We split source vintage from page review date on every entity page.
        Each of the FBX, WB LPI, UNCTAD, WCO, and CBP source vintages is
        labeled separately at the source level so readers can see exactly
        which edition backs which figure. The page review date is labeled
        separately and reflects when the editorial team last re-read the
        page copy. A page review that does not coincide with a new FBX,
        WB LPI, UNCTAD, WCO, or CBP edition does not bump the corresponding
        source vintage — that would imply newer data than exists.
      </p>

      <h2>9. Disclosure: operator location</h2>
      <p>
        ShipCalcWize is operated outside the United States. The CBP Section
        321 guidance we relay, the WCO HS Nomenclature we encode, the FBX
        index we cross-reference, the WB LPI score we display, and the
        UNCTAD Maritime Transport baseline we cite are all published by the
        named authority. The site does not provide US customs entry,
        commercial classification rulings, or broker services, does not
        represent readers before US CBP or any foreign customs authority,
        and operates as a data-relay reference only.
      </p>

      <AuthorBox />
    </article>
  );
}
