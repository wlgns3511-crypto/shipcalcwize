import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Methodology",
  description: "Learn how ShipCalcWize collects, processes, and verifies international shipping cost estimates and customs information.",
  alternates: { canonical: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        ShipCalcWize is committed to providing accurate, comprehensive, and up-to-date data.
        This page explains how we collect, process, and verify our information.
      </p>

      <h2>Data Sources</h2>
      <p>
        Our data is sourced from authoritative, publicly available databases including: <strong>World Customs Organization, Carrier Rate Databases</strong>.
        We cross-reference multiple sources to ensure accuracy and completeness.
      </p>

      <h2>Data Collection Process</h2>
      <ol>
        <li><strong>Automated Ingestion</strong> &mdash; We use automated pipelines to regularly pull data from our primary sources, ensuring freshness and consistency.</li>
        <li><strong>Normalization</strong> &mdash; Raw data is cleaned, standardized, and structured into our unified database schema for easy comparison and analysis.</li>
        <li><strong>Cross-Validation</strong> &mdash; We compare data points across multiple sources to identify and resolve discrepancies.</li>
        <li><strong>Expert Review</strong> &mdash; Our editorial team reviews flagged entries and applies domain expertise to ensure quality.</li>
      </ol>

      <h2>Update Frequency</h2>
      <p>
        Our databases are updated <strong>monthly</strong> to reflect the latest available information.
        Each page displays a verification timestamp showing when the data was last confirmed.
      </p>

      <h2>Quality Assurance</h2>
      <ul>
        <li>Automated integrity checks run daily to detect anomalies</li>
        <li>User feedback is actively monitored and incorporated</li>
        <li>All data transformations are logged and auditable</li>
        <li>We maintain version history for all critical datasets</li>
      </ul>

      <h2>Limitations</h2>
      <p>
        While we strive for accuracy, our data reflects the most recent publicly available information
        and may not capture real-time changes. We encourage users to verify critical data points
        with primary sources for important decisions.
      </p>

      <h2>Official Data Sources</h2>
      <ul>
        <li><a href="https://www.wcoomd.org/" target="_blank" rel="noopener noreferrer">World Customs Organization (WCO)</a> &mdash; Harmonized System classification and customs standards</li>
        <li><a href="https://www.trade.gov/" target="_blank" rel="noopener noreferrer">International Trade Administration (ITA)</a> &mdash; U.S. trade data and export regulations</li>
        <li><a href="https://www.cbp.gov/" target="_blank" rel="noopener noreferrer">U.S. Customs and Border Protection (CBP)</a> &mdash; Import duties and trade compliance</li>
        <li><a href="https://unctad.org/" target="_blank" rel="noopener noreferrer">UNCTAD</a> &mdash; International trade and development statistics</li>
        <li><a href="https://www.ups.com/us/en/support/shipping-support/shipping-costs-and-rates.page" target="_blank" rel="noopener noreferrer">UPS Rate Information</a> &mdash; Carrier shipping rate references</li>
        <li><a href="https://www.fedex.com/en-us/shipping/rate-information.html" target="_blank" rel="noopener noreferrer">FedEx Rate Information</a> &mdash; Express and freight rate references</li>
      </ul>

      <h2>Contact</h2>
      <p>
        If you find inaccuracies or have suggestions for improvement, please
        <a href="/contact">contact us</a>. We value community input in maintaining data quality.
      </p>
    </article>
  );
}
