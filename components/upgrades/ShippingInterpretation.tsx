/**
 * ShippingInterpretation — composite verdict strip
 *
 * Renders the 4-paragraph verdict from `lib/shipping-interpretation.ts` above
 * the per-dimension tier cards. The verdict composes (LandedCostTier ×
 * VatBurdenTier × TransitWindowTier) into a single decision-framing branch
 * and prose block; cutoff thresholds live in the lever modules themselves.
 *
 * Visual contract:
 *   - Single-color tone derived from `interpretation.tone` (matches the
 *     dominant lever — emerald/green/amber/orange/rose/slate).
 *   - Verdict line in bold + 4 paragraphs in body type.
 *   - "How this verdict was composed" details panel listing each lever tier
 *     and the chosen decisionFraming branch for auditability.
 *
 * No client-side state. Server-rendered string output keyed by the tier
 * tuple is byte-identical on every build (matches the determinism guarantee
 * of the lever and the composite).
 */

import type { ShippingInterpretation as Result } from '@/lib/shipping-interpretation';

interface Props {
  interpretation: Result;
  countryName: string;
}

export function ShippingInterpretation({ interpretation, countryName }: Props) {
  const tone = interpretation.tone;
  return (
    <section
      data-upgrade="shipping-interpretation"
      className={`mb-6 rounded-lg border bg-white px-5 py-5 border-${tone}-200`}
    >
      <header className="mb-3">
        <p className={`text-xs uppercase tracking-wider font-semibold text-${tone}-700 m-0`}>
          Shipping verdict — {countryName}
        </p>
        <p className={`text-lg font-bold m-0 mt-1 text-${tone}-900`}>
          {interpretation.verdict}
        </p>
      </header>

      <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
        {interpretation.paragraphs.map((p, i) => (
          <p key={i} className="m-0">
            {p}
          </p>
        ))}
      </div>

      <details className="mt-4 text-xs text-slate-600">
        <summary className={`cursor-pointer text-${tone}-700 hover:underline font-medium`}>
          How this verdict was composed
        </summary>
        <div className="mt-2 space-y-1">
          <ul className="list-disc pl-5 space-y-0.5">
            {interpretation.drivers.map((d, i) => (
              <li key={i} className="m-0">{d}</li>
            ))}
          </ul>
          <p className="m-0 mt-2 text-slate-500">
            Confidence: <strong className="text-slate-700">{interpretation.confidence}</strong>
            {' '}· decisionFraming: <code className="text-slate-700">{interpretation.decisionFraming}</code>
          </p>
          <ul className="list-disc pl-5 space-y-0.5 mt-2">
            {interpretation.caveats.map((c, i) => (
              <li key={i} className="m-0 text-slate-500">{c}</li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
