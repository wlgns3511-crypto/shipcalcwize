import type { ShippingInterpretation } from "@/lib/shipping-interpretation";

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/** Minimal shape of the LandedCostTier compute result this note reads. */
type LandedResult = {
  tier: "A" | "B" | "C" | "D" | "E" | null;
  totalCostUsd: number | null;
  shippingCostUsd: number | null;
  dutyCostUsd: number | null;
  processingFeeUsd: number;
  hsDutyPct: number | null;
  weightKg: number;
  mode: "sea" | "air";
};

/** Minimal shape of the VatBurdenTier compute result this note reads. */
type VatResult = {
  tier: "A" | "B" | "C" | "D" | "E" | null;
  vatPct: number | null;
  deMinimisUsd: number | null;
  deMinimisLocal: number | null;
  currency: string | null;
  dutyRangeUpperPct: number | null;
};

/** Minimal shape of the TransitWindowTier compute result this note reads. */
type TransitResult = {
  tier: "A" | "B" | "C" | "D" | "E" | null;
  airDays: number | null;
  seaDays: number | null;
};

export interface ShippingModelMethodologyNoteProps {
  countryName: string;
  /** Cheaper-of (sea, air) landed-cost result used for the headline cost line. */
  landed: LandedResult;
  vat: VatResult;
  transit: TransitResult;
  interpretation: ShippingInterpretation;
  /** WCO HS duty-range midpoint actually fed into the landed-cost classifier. */
  dutyMidpointPct: number | null;
}

/**
 * First-person provenance note for the shipping composite-verdict dimension.
 *
 * The country page composes four published industry sources — Freightos Baltic
 * Index per-kg freight, World Bank LPI-adjusted transit days, WCO HS duty
 * schedules, and CBP / destination de-minimis thresholds — into three tiers
 * (LandedCostTier × VatBurdenTier × TransitWindowTier) and one composite
 * decision-framing verdict. That synthesis sits in no single published table,
 * which is exactly the first-hand-analysis (Experience) signal answer engines
 * weigh for E-E-A-T — but the rest of the page states it in an impersonal
 * voice, understating that signal.
 *
 * This note narrates the ORIGINAL composition in first person, with every
 * figure pulled live from the compute results (`landed`, `vat`, `transit`,
 * `interpretation`) — never hardcoded — so it stays accurate per destination,
 * including the data-gap case where two or more tiers return no-data and the
 * verdict is honestly suppressed.
 *
 * Honesty boundary (mandatory): we combined published baselines into tiers and
 * a framing. We did NOT pull live carrier quotes, contract rates, or
 * freight-forwarder margin — those override the model on any individual
 * booking, and the note says so.
 */
export function ShippingModelMethodologyNote({
  countryName,
  landed,
  vat,
  transit,
  interpretation,
  dutyMidpointPct,
}: ShippingModelMethodologyNoteProps) {
  const incomplete = interpretation.decisionFraming === "data-incomplete";

  // De-minimis phrasing: prefer the published local figure, fall back to USD.
  const deMinimisPhrase =
    vat.deMinimisLocal != null && vat.currency != null && vat.currency.toUpperCase() !== "USD" && vat.deMinimisUsd != null
      ? `${vat.deMinimisLocal} ${vat.currency} (~${usd(vat.deMinimisUsd)})`
      : vat.deMinimisUsd != null
        ? usd(vat.deMinimisUsd)
        : null;

  // Best published transit lane: name whichever mode classified the window.
  const transitPhrase =
    transit.airDays != null
      ? `a ${transit.airDays}-day best air lane`
      : transit.seaDays != null
        ? `a ${transit.seaDays}-day best sea lane (no air lane published)`
        : "no published lane";

  return (
    <section
      className="my-6 rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm leading-relaxed text-stone-700"
      data-upgrade="shipping-model-methodology"
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-stone-500">
        How we modeled this lane
      </p>

      {incomplete ? (
        <p>
          For {countryName} we tried to compose our usual four published
          baselines — Freightos Baltic Index per-kg freight, World Bank
          LPI-adjusted transit days, the WCO HS duty schedule, and the
          destination de-minimis threshold — into a landed-cost, a VAT-burden,
          and a transit-window tier. At least two of those three came back as
          no-data for this destination, so we deliberately suppressed the
          composite verdict rather than interpolate a freight, customs, or
          transit number we cannot source. The tiers we could read are{" "}
          {landed.tier ? `landed cost Tier ${landed.tier}` : "landed cost (no data)"},{" "}
          {vat.tier ? `VAT-burden Tier ${vat.tier}` : "VAT-burden (no data)"}, and{" "}
          {transit.tier ? `transit Tier ${transit.tier}` : "transit (no data)"} —
          pull the destination customs authority page and two carrier quotes
          before booking this lane.
        </p>
      ) : (
        <p>
          To frame the {countryName} lane we combined four published industry
          baselines into three tiers and one composite verdict. On the
          freight-plus-customs side, we took the Freightos Baltic Index-derived{" "}
          {landed.mode} baseline for a {landed.weightKg}kg reference parcel —{" "}
          {landed.shippingCostUsd != null ? usd(landed.shippingCostUsd) : "an unpriced"} of
          freight
          {landed.hsDutyPct != null && landed.dutyCostUsd != null
            ? `, layered the WCO HS duty midpoint of ${landed.hsDutyPct.toFixed(1)}% (about ${usd(landed.dutyCostUsd)} on a $200 commodity reference)`
            : ""}
          {landed.processingFeeUsd > 0
            ? ` and a ${usd(landed.processingFeeUsd)} CBP-equivalent processing fee`
            : ""}
          {landed.totalCostUsd != null
            ? ` — for roughly ${usd(landed.totalCostUsd)} all-in, a landed cost Tier ${landed.tier}`
            : ` — a landed cost Tier ${landed.tier}`}
          . Separately we read the destination&rsquo;s VAT-at-border:{" "}
          {vat.vatPct != null ? `${vat.vatPct.toFixed(1)}% VAT/GST` : "no published VAT/GST"}
          {deMinimisPhrase != null ? ` against a ${deMinimisPhrase} de-minimis` : ""}
          {vat.dutyRangeUpperPct != null
            ? ` and a duty range topping out near ${vat.dutyRangeUpperPct.toFixed(0)}%`
            : ""}
          , which classifies as VAT-burden Tier {vat.tier}. And from our
          per-route table we took {transitPhrase}, a transit-window Tier{" "}
          {transit.tier}. Composing the three the same way every build, the
          dominant framing for {countryName} is{" "}
          <code className="text-stone-600">{interpretation.decisionFraming}</code>:{" "}
          {interpretation.verdict}
        </p>
      )}

      <p className="mt-2 text-xs text-stone-500">
        Editorial synthesis of FBX freight, World Bank LPI transit, WCO HS duty
        schedules, and CBP / destination de-minimis — not live carrier quotes,
        contract rates, or freight-forwarder margin, which override the model on
        any individual booking. Tier cutoffs and sources are in the lever cards
        below.
      </p>
    </section>
  );
}
