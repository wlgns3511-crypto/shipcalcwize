/**
 * Phase 7 P5 — Internal Cross-Walk Bridge for shipcalcwize /state/[slug]/.
 *
 * Surfaces 4 INTERNAL DataPeek portfolio siblings (out of a 6-site
 * pool) that join on the same state slug. Per playbook §8.3 state
 * cluster — adjacent state-level cost dimensions a shipper or
 * importer reads alongside the ground-baseline + gateway-tier read.
 *
 * Direct cross-border sibling: tariffpeek (just deployed 2026-05-20
 * with the same /state/[slug]/ surface — composite of Census × USITC ×
 * USTR × CBP). The two sites form a natural sibling cluster
 * (shipping ↔ tariff) on cross-border trade.
 *
 * Each anchor names the secondary lens it adds to the shipping
 * decision (methodology framing per link) — mitigates Trap T-P5-1
 * (footprint-style cross-link uniformity).
 *
 * FNV-1a deterministic per-slug ordering: each state surfaces a
 * different 4-of-6 ordering so the cross-site footprint varies
 * across the 51 jurisdictions.
 *
 * Slug convention: all 6 siblings serve /state/{bare-state-slug}/
 * as 200 (verified 2026-05-20 cold-probe on california + north-dakota).
 */
import type { CrosswalkResult } from '@/lib/crosswalk-shipflow';

interface Props {
  crosswalk: CrosswalkResult | null;
  stateSlug: string;
}

interface SiblingLink {
  domain: string;
  label: string;
  methodologyBridge: string;
}

const SIBLING_POOL: SiblingLink[] = [
  {
    domain: 'tariffpeek.com',
    label: 'TariffPeek',
    methodologyBridge:
      'State-level Trade Exposure Tier (Census Foreign Trade × USITC HTS chapter-weighted MFN × USTR Section 301 / IEEPA policy-stack) — pairs the shipping baseline here with the tariff overlay riding on top of the same state\'s import lanes.',
  },
  {
    domain: 'biztaxwize.com',
    label: 'BizTaxWize',
    methodologyBridge:
      'State corporate / pass-through income-tax structure shapes whether the in-state distributor or e-commerce seller absorbs shipping-driven landed-cost hikes — pairs the ground baseline here with the after-tax margin pressure the same firm carries.',
  },
  {
    domain: 'wagepeek.com',
    label: 'WagePeek',
    methodologyBridge:
      'BLS OES state-by-occupation wage levels signal how much room the labor side of the warehousing / last-mile cost stack has to absorb pass-through shipping costs before retail prices move — pairs ship-flow tier with the wage denominator on the same jurisdiction.',
  },
  {
    domain: 'powerbillpeek.com',
    label: 'PowerBillPeek',
    methodologyBridge:
      'EIA average retail electricity price feeds directly into warehousing / cold-chain operating cost (refrigerated parcels especially) — pairs the gateway-access read above with the energy denominator of in-state distribution.',
  },
  {
    domain: 'propertytaxpeek.com',
    label: 'PropertyTaxPeek',
    methodologyBridge:
      'Effective property-tax rate is the fixed-cost floor a state imposes on importer warehouse + port-of-entry distribution real estate — pairs port concentration here with the carrying cost of the logistics footprint.',
  },
  {
    domain: 'netpaypeek.com',
    label: 'NetPayPeek',
    methodologyBridge:
      'Federal + state income-tax + FICA withholding lands the household take-home that buys the shipped goods this page priced — pairs the in-state ship-cost denominator with the disposable-income side that meets it at retail.',
  },
];

/** FNV-1a 32-bit hash for deterministic per-slug seeding. */
function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Pick 4 siblings, ordered deterministically by slug-seeded rotation. */
function pickSiblings(slug: string): SiblingLink[] {
  const n = SIBLING_POOL.length;
  const start = fnv1a(`shipcalcwize-crosswalk-${slug}`) % n;
  const out: SiblingLink[] = [];
  for (let i = 0; i < 4; i++) {
    out.push(SIBLING_POOL[(start + i) % n]);
  }
  return out;
}

export function CrosswalkBridge({ crosswalk, stateSlug }: Props) {
  if (!crosswalk) return null;
  const siblings = pickSiblings(stateSlug);
  return (
    <aside className="mt-8 mb-6 rounded-xl border border-indigo-200 bg-indigo-50/40 p-5" data-upgrade="crosswalk-bridge">
      <h2 className="text-base font-bold text-indigo-900 mb-1">
        Cross-walk {crosswalk.stateName} on other state-level cost dimensions
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        ShipCalcWize composes BTS shipping volume × USPS rate sheets × CBP ports of entry × UPU
        cross-border terminal-dues framework into a {crosswalk.composedScore}/100 composite
        ({crosswalk.shipFlowTierLabel}). The four sibling lenses below join on the same state slug
        and add adjacent dimensions a shipper or in-state distributor reads before sizing the
        landed-cost question.
      </p>
      <ul className="space-y-2">
        {siblings.map((s) => (
          <li key={s.domain} className="text-sm text-slate-700 leading-relaxed">
            <a
              href={`https://${s.domain}/state/${stateSlug}/`}
              rel="external"
              className="text-indigo-800 font-semibold underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-700"
            >
              {s.label} — {crosswalk.stateName}
            </a>
            <span className="text-slate-600"> · {s.methodologyBridge}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
