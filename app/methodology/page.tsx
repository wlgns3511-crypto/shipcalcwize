import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";
import { METHODOLOGY_VINTAGE } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Our Methodology — How ShipCalcWize Builds Its Shipping Data",
  description:
    "Exactly how ShipCalcWize derives its international shipping cost baselines and transit times — which industry benchmarks we lean on, how we compute figures, and what the numbers cannot tell you.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Freight quotes are a real money decision for importers, e-commerce
        sellers, and relocating families. You deserve to know exactly how
        our cost and transit figures are assembled, what they represent, and
        where they fall short of a live carrier quote.
      </p>

      <h2>What our figures represent</h2>
      <div className="not-prose border-l-4 border-amber-400 bg-amber-50 p-4 my-4 rounded-r">
        <p className="text-sm text-amber-900">
          <strong>Important disclosure.</strong> The country-level
          $/kg and transit-day figures on ShipCalcWize are{" "}
          <em>industry-typical baselines</em>, not live rates pulled from
          a carrier API. A live quote from DHL, FedEx, UPS, or a freight
          forwarder will differ based on your actual weight, dimensions,
          service level, fuel surcharge, peak-season index, and
          contract discounts.
        </p>
      </div>
      <p>
        Use our figures for rough planning, cross-country comparison, and
        deciding between air and sea. For any shipment you&apos;re about to
        book, get a live quote from the carrier you intend to use.
      </p>

      <h2>How we build the baselines</h2>
      <p>
        Each country entry combines several inputs that together approximate
        a realistic industry baseline:
      </p>
      <ol>
        <li>
          <strong>Published carrier tariff sheets.</strong> DHL, FedEx, UPS,
          and regional integrators publish zone-based rate tables for both
          express and standard services. We anchor per-kg air freight to
          these published zones for the country&apos;s region.
        </li>
        <li>
          <strong>Freight rate indices.</strong> For sea freight we lean on
          public container-rate indices such as the{" "}
          <a
            href="https://fbx.freightos.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Freightos Baltic Index
          </a>{" "}
          and the Drewry World Container Index, normalized to a per-kg basis
          for general cargo.
        </li>
        <li>
          <strong>World Bank Logistics Performance Index.</strong> The{" "}
          <a
            href="https://lpi.worldbank.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            World Bank LPI
          </a>{" "}
          benchmarks each country&apos;s customs, infrastructure, tracking,
          and on-time performance. We use this to adjust transit-day
          expectations for destinations with slower customs clearance or
          last-mile delivery.
        </li>
        <li>
          <strong>UNCTAD maritime statistics.</strong> The{" "}
          <a
            href="https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport"
            target="_blank"
            rel="noopener noreferrer"
          >
            UNCTAD Review of Maritime Transport
          </a>{" "}
          provides the authoritative annual overview of container shipping
          capacity, port throughput, and major-route rate trends.
        </li>
      </ol>

      <h2>Customs and duties</h2>
      <p>
        Our country pages link out to TariffPeek for HS code classification
        and duty rates, because the right duty for your specific product
        depends on classification that changes across product families. The
        foundational customs references we rely on are:
      </p>
      <ul>
        <li>
          <a
            href="https://www.wcoomd.org/en/topics/nomenclature/overview.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            World Customs Organization (WCO)
          </a>{" "}
          &mdash; the authoritative source for the Harmonized System (HS)
          codes used worldwide for tariff classification.
        </li>
        <li>
          <a
            href="https://www.cbp.gov/trade"
            target="_blank"
            rel="noopener noreferrer"
          >
            US Customs and Border Protection
          </a>{" "}
          &mdash; the authoritative US import reference, including Section
          321 de minimis rules and Section 301 tariff actions.
        </li>
        <li>
          <a
            href="https://www.trade.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            International Trade Administration (ITA)
          </a>{" "}
          &mdash; US Department of Commerce resource for trade agreements,
          export controls, and FTA lookups.
        </li>
        <li>
          <a
            href="https://iccwbo.org/business-solutions/incoterms-rules/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Incoterms 2020 (ICC)
          </a>{" "}
          &mdash; the international standard that defines who pays for
          freight, duties, and insurance at each stage of an international
          shipment.
        </li>
      </ul>

      <h2>Air vs sea decision framing</h2>
      <p>
        The air-vs-sea choice is the single most impactful decision you make
        on an international shipment. Our rule-of-thumb breakdown (widely
        accepted in the industry, though not universal):
      </p>
      <ul>
        <li>
          <strong>Under ~10 kg</strong> &mdash; air freight almost always
          wins on landed cost, because small-parcel sea handling has high
          fixed overhead.
        </li>
        <li>
          <strong>10 – 100 kg</strong> &mdash; depends on urgency and
          product value. High-value or time-sensitive goods go air; bulky or
          low-margin goods go sea.
        </li>
        <li>
          <strong>Over 100 kg, not urgent</strong> &mdash; sea freight
          (typically LCL, less-than-container-load) wins decisively on per-kg
          cost, at the price of 3&ndash;8 extra weeks of transit.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        Freight rate indices update weekly to monthly; carrier tariff
        revisions happen annually with mid-year fuel surcharge adjustments.
        We refresh our baseline tables quarterly and immediately when a
        major shift (e.g., capacity crunch, Red Sea disruption) changes the
        underlying indices meaningfully.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>No live rate lookups.</strong> Our numbers are planning
          figures, not quotes. A freight forwarder will always give you a
          tighter number for an actual shipment.
        </li>
        <li>
          <strong>No volumetric weight modeling.</strong> Carriers charge by
          the greater of actual and volumetric weight. Large, light
          packages cost much more than the per-kg figures suggest.
        </li>
        <li>
          <strong>No duty calculation.</strong> Our cost columns are
          freight-only. Duties, VAT, GST, and broker fees can add
          5&ndash;25% or more on top depending on product and destination.
        </li>
        <li>
          <strong>No carrier-specific quirks.</strong> USPS, Canada Post,
          Royal Mail, Japan Post, and similar national postal services
          price very differently from the integrator carriers. Our
          baselines assume commercial integrator pricing.
        </li>
        <li>
          <strong>Not logistics advice.</strong> Nothing on ShipCalcWize
          constitutes professional logistics, customs-brokerage, or legal
          advice. For shipments with real money on the line, work with a
          licensed freight forwarder or customs broker.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published carrier rate or official index disagrees with a
        figure you see here, please <a href="/contact">contact us</a> with
        the source and the number. Corrections from the community are the
        fastest way we improve the dataset.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected here
        before they reach production pages.
      </p>

      <AuthorBox
        vintage={METHODOLOGY_VINTAGE}
        source="ShipCalcWize Methodology"
      />
    </article>
  );
}
