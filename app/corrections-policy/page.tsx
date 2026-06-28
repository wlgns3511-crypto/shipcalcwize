import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";
import { AuthorBox } from "@/components/AuthorBox";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: "How ShipCalcWize processes FBX index revisions, WB LPI edition rotations, UNCTAD updates, WCO HS amendments, and CBP Section 321 guidance changes — and the escalation path for reader-flagged discrepancies.",
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { url: "/corrections-policy/" },
};

export default function CorrectionsPolicyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
      <h1>Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last updated:{" "}
        <time dateTime={LEGAL_VINTAGES.correctionsPolicy}>{LEGAL_VINTAGES.correctionsPolicy}</time>
      </p>
      <p className="lead">
        This page documents how ShipCalcWize processes corrections,
        distinguishes a factual error from a source-vintage refresh, and
        lays out the escalation path when a reader believes an FBX-, WB LPI-,
        UNCTAD-, WCO-, or CBP-derived figure disagrees with the authoritative
        release.
      </p>

      <h2>1. Two types of correction</h2>
      <p>
        ShipCalcWize treats <strong>factual errors</strong> and{" "}
        <strong>editorial methodology revisions</strong> as separate
        correction classes. A factual error is a transcription mistake, a
        stale country baseline, a CBP Section 321 reference that has been
        amended since our last ingest, a WCO HS code that has been
        re-classified, or an FBX value that the index publisher has revised
        post-release. An editorial methodology revision is a change to how
        the LandedCostTier classifier is computed or how the DeMinimisDecoder
        classifies a country. Factual errors are corrected as soon as
        verified; methodology revisions are documented on the editorial
        policy page before reaching production.
      </p>

      <h2>2. FBX weekly index rotation</h2>
      <p>
        The Freightos Baltic Index publishes a new value every week. When
        the new FBX value materially shifts the country-level shipping
        baseline (more than the editorial review threshold), we re-derive
        the country baseline, re-run the LandedCostTier classifier where
        applicable, and publish the updated figure with the new FBX
        vintage label. An FBX rotation is a vintage refresh, not a
        correction — the previous figure was accurate to its FBX release
        date, and the new figure is accurate to the newer FBX release.
      </p>

      <h2>3. WB LPI triennial edition rotation</h2>
      <p>
        The World Bank publishes a new Logistics Performance Index every
        two to three years. When the new WB LPI edition becomes available,
        we re-ingest the 177-country scores, re-derive the transit-day
        calibration, and publish updated country pages with the new WB LPI
        vintage label. A WB LPI rotation is a vintage refresh. The
        intra-edition window (during which we cite the same WB LPI
        edition for several years) is documented on the methodology page;
        we do not interpolate between WB LPI editions because the World
        Bank does not publish interim scores.
      </p>

      <h2>4. UNCTAD Maritime Transport annual rotation</h2>
      <p>
        The UNCTAD Review of Maritime Transport is published annually.
        When the new UNCTAD edition becomes available, we re-cross-reference
        the capacity baseline, flag any country whose UNCTAD-reported
        throughput materially diverges from the prior edition, and update
        the country page with the new UNCTAD vintage label. UNCTAD
        rotations are vintage refreshes, not corrections.
      </p>

      <h2>5. WCO HS Nomenclature amendment rotation</h2>
      <p>
        The World Customs Organization revises the Harmonized System
        Nomenclature on a multi-year cycle (the current edition is WCO HS
        2022). When the WCO publishes an HS amendment, we re-ingest the
        affected HS codes into our 1,686-line classification JSON,
        reclassify any country page that relies on an amended code, and
        flag the WCO HS vintage on the affected pages. The WCO HS
        Nomenclature is the global six-digit standard; country-specific
        eight- and ten-digit extensions are governed by each country&apos;s
        customs authority and tracked separately on individual country
        pages.
      </p>

      <h2>6. CBP Section 321 / Part 148 guidance rotation</h2>
      <p>
        US Customs and Border Protection publishes Federal Register notices
        and Cargo Systems Messaging Service (CSMS) bulletins when Section
        321 / Part 148 guidance changes. When CBP issues a notice that
        affects the $800 de-minimis threshold, the Type 86 entry pathway,
        or any documented carve-out, we update the affected pages and
        de-minimis.json within the editorial review SLA. A change in the
        statutory threshold (driven by Congressional action) is published
        with the new CBP vintage label.
      </p>

      <h2>7. What does NOT count as a correction</h2>
      <p>
        The following are <strong>vintage refreshes</strong> and not
        corrections:
      </p>
      <ul>
        <li>A new FBX weekly index value replacing the prior week.</li>
        <li>A new WB LPI triennial edition replacing the prior edition.</li>
        <li>A new UNCTAD Annual Review of Maritime Transport edition.</li>
        <li>
          A WCO HS Nomenclature amendment affecting one or more six-digit
          codes.
        </li>
        <li>
          A CBP Section 321 / Part 148 guidance update that does not change
          the underlying $800 statutory threshold.
        </li>
        <li>
          A LandedCostTier or DeMinimisDecoder recomputation triggered by an
          FBX, WB LPI, UNCTAD, WCO, or CBP edition rotation.
        </li>
      </ul>

      <h2>8. What DOES count as a correction</h2>
      <ul>
        <li>
          A page displaying an FBX-derived figure that disagrees with the
          FBX published value for the same week.
        </li>
        <li>
          A WB LPI score on a country page that disagrees with the World
          Bank&apos;s published score for the same WB LPI edition.
        </li>
        <li>
          A UNCTAD capacity figure that disagrees with the corresponding
          UNCTAD Review of Maritime Transport edition.
        </li>
        <li>
          A WCO HS code or duty percentage that misclassifies a commodity
          relative to the WCO Nomenclature.
        </li>
        <li>
          A CBP Section 321 reference that disagrees with the current CBP
          Part 148 guidance, or a non-US de-minimis figure that disagrees
          with the relevant country&apos;s customs authority publication.
        </li>
        <li>
          A LandedCostTier classification that misapplies the published
          tier cutoffs to the documented inputs.
        </li>
        <li>
          A typographical or arithmetic error in any computed value on a
          country, state, or guide page.
        </li>
      </ul>

      <h2>9. Escalation path</h2>
      <p>
        If you find a country baseline, source label, HS classification,
        de-minimis figure, or methodology note that appears incorrect, send
        the page URL and source evidence (a link to the FBX release, the
        WB LPI portal entry, the UNCTAD edition, the WCO HS Nomenclature
        entry, the CBP Federal Register notice, or equivalent) through the{" "}
        <a href="/contact/" className="text-amber-700 hover:underline">contact page</a>
        . Verified factual errors are corrected in the page copy and in the
        associated schema-level freshness label within two business days.
        Methodology disputes are routed to the editorial review queue and
        addressed on the editorial policy page before reaching production.
      </p>

      <h2>10. Audit log</h2>
      <p>
        Material corrections (changes to a published FBX-derived baseline,
        a LandedCostTier tier flip, a DeMinimisDecoder reclassification, a
        WCO HS reclassification) are labeled with a page-level{" "}
        <code>dateModified</code> on the affected page and reflected in the
        corresponding schema.org Dataset metadata. Cosmetic copy edits,
        link updates, and ad-slot adjustments are not logged because they
        do not change the underlying FBX-, WB LPI-, UNCTAD-, WCO-, or CBP-
        derived figure.
      </p>

      <h2>11. Contact</h2>
      <p>
        Direct corrections inquiries go through the{" "}
        <a href="/contact/" className="text-amber-700 hover:underline">contact page</a>
        . FBX index questions are best directed to fbx.freightos.com. WB LPI
        score questions are best directed to lpi.worldbank.org. UNCTAD
        Maritime Transport questions are best directed to unctad.org. WCO
        HS Nomenclature questions are best directed to wcoomd.org. CBP
        Section 321 questions are best directed to cbp.gov or to a
        licensed customs broker.
      </p>

      <AuthorBox />
    </article>
  );
}
