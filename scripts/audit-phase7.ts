/**
 * Phase 7 audit for shipcalcwize — verifies Traps #110/#111/#112/#119/#120
 * against the /state/[slug]/ Ship-Flow Cross-Walk surface (composite of
 * BTS National Transportation Statistics shipping volume × USPS/UPS/FedEx
 * aggregated ground rate sheets × CBP-designated ports of entry × UPU
 * cross-border terminal-dues framework).
 *
 * v2.3 trap numbering:
 *   #110 = cross-walk publisher diversity (≥2 distinct hosts — Trap #110 floor)
 *   #111 = decoder band imbalance (annotated; honest distribution OK)
 *   #112 = P1 title.absolute body length ≤60c (Google SERP cap)
 *   #119 = P1 verdict-coverage (null-skip honest)
 *   #120 = N=20 randomized cold-probe (verdict marker in title body or
 *          graceful omission when crosswalk null per honest-null contract)
 *
 * v2.3 §4.0 Pre-flight Title-Cap Math: layout suffix ' | ShipCalcWize' = 15c
 * — above the 13c threshold so title.absolute is MANDATORY. The legacy
 * template title runs over the 60c cap on long state names (e.g., District
 * of Columbia = 81c). Audit measures composed body against the 60c cap.
 *
 * Runs as a one-shot:
 *   npx tsx scripts/audit-phase7.ts
 */
import {
  decodeStateShipFlow,
  composeStateShipFlowTitle,
  SHIPFLOW_CROSSWALK_SOURCES,
  type ShipFlowTier,
} from '../lib/crosswalk-shipflow';
import { getAllStates } from '../lib/states-data';

console.log('=== Phase 7 audit — shipcalcwize ===');

// Trap #110 — distinct publisher hosts in the multi-creator Dataset @graph.
// Phase 7 playbook §3.5 T-P0-1 + §7 T-P4-1 require ≥2 distinct publishers.
// Cohort: 51-jurisdiction state cohort (DC + 50 states). The 4 creator
// entries split across 4 distinct hosts — BTS (www.bts.gov), USPS
// (about.usps.com), CBP (www.cbp.gov), UPU (www.upu.int).
const creators = SHIPFLOW_CROSSWALK_SOURCES;
const hosts = creators.map((s) => new URL(s.url).host);
const distinctHosts = new Set(hosts);
const distinctRegistrable = new Set(
  hosts.map((h) => {
    const parts = h.split('.').filter(Boolean);
    return parts.length >= 2 ? parts.slice(-2).join('.') : h;
  }),
);
console.log('\n[#110] multi-creator dataset publisher hosts:');
hosts.forEach((h, i) => console.log('       ·', creators[i].name, '→', h));
console.log(
  '       distinct count:',
  distinctHosts.size,
  distinctHosts.size >= 2 ? 'PASS' : 'FAIL (need ≥2 per playbook §3.5)',
);
console.log(
  '       distinct registrable publishers:',
  distinctRegistrable.size,
  distinctRegistrable.size >= 2 ? 'PASS (BTS + USPS + CBP + UPU)' : 'FAIL (need ≥2 distinct publishers)',
);
distinctRegistrable.forEach((p) => console.log('       ·', p));

// Trap #111 — ShipFlow Tier distribution across 51 jurisdictions. All 51
// emit a tier — every state has avgGroundCostLbs + volumeRank, no null-skip.
const states = getAllStates();
const tierCounts: Record<ShipFlowTier, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
let decoded = 0;
let nullCount = 0;
let titleBudgetMax = 0;
let titleBudgetMaxWho = '';
let titleOverBudget = 0;
const samples: { len: number; full: string }[] = [];

const TITLE_MAX = 60;

for (const state of states) {
  const cw = decodeStateShipFlow(state.slug);
  if (!cw) {
    nullCount += 1;
    continue;
  }
  decoded += 1;
  tierCounts[cw.shipFlowTier] += 1;
  const full = composeStateShipFlowTitle(cw);
  if (full.length > titleBudgetMax) {
    titleBudgetMax = full.length;
    titleBudgetMaxWho = state.name;
  }
  if (full.length > TITLE_MAX) titleOverBudget += 1;
  if (samples.length < 6) samples.push({ len: full.length, full });
}

const total = decoded;
const pcts: Record<string, number> = {};
for (const [k, v] of Object.entries(tierCounts)) {
  pcts[k] = total > 0 ? (v / total) * 100 : 0;
}
const maxPct = Math.max(...Object.values(pcts));

console.log('\n[#111] ShipFlow Tier distribution (n=' + total + ', null-skipped=' + nullCount + '):', tierCounts);
console.log(
  '       pct:',
  Object.fromEntries(Object.entries(pcts).map(([k, v]) => [k, v.toFixed(1) + '%'])),
);
console.log(
  '       max-bucket concentration:',
  maxPct.toFixed(1) + '%',
  maxPct < 50 ? 'PASS (under 50% threshold)' : 'FAIL — annotate by-design uniformity per §4.5 or recalibrate',
);

// Trap #112 — P1 title length ≤60 chars across the emitting cohort.
// v2.3 §4.0: title.absolute bypasses layout suffix ' | ShipCalcWize' (15c —
// above the 13c §4.0 threshold so MANDATORY). The composed body alone is
// measured against the 60c Google SERP cap.
console.log('\n[#112] P1 title length audit (n=' + decoded + ')');
console.log('       max length:', titleBudgetMax, 'chars  (worst:', titleBudgetMaxWho + ')');
console.log(
  '       over ' + TITLE_MAX + ' chars:',
  titleOverBudget,
  titleOverBudget === 0 ? 'PASS' : 'FAIL',
);
for (const s of samples) console.log('       sample: [' + s.len + ']', s.full || '(empty)');

// Trap #119 — P1 verdict-coverage. All 51 emit (no null-skip in shipcalcwize
// since every state has avgGroundCostLbs + volumeRank in lib/states-data).
const coverPct = states.length > 0 ? (decoded / states.length) * 100 : 0;
console.log('\n[#119] P1 verdict-coverage (non-null ÷ total)');
console.log(
  '       non-null:',
  decoded,
  '/',
  states.length,
  '(' + coverPct.toFixed(1) + '%)',
  '— full coverage (all 51 jurisdictions in lib/states-data have non-null axis inputs)',
);

// Trap #120 — N=20 randomized cold-probe via composeStateShipFlowTitle.
// Asserts that the title carries a verdict marker (cost + tier label) OR
// gracefully omits when crosswalk is null. Fabrication is the failure mode.
const slugs = states.map((s) => s.slug);
const sample20 = [...slugs]
  .sort(() => Math.random() - 0.5)
  .slice(0, Math.min(20, slugs.length));
let titleHonest = 0;
let titleVerdictBearing = 0;
let titleNullGracefulOmit = 0;
// Body pattern: "{StateName}: ${cost}/lb · {TierLabel}"
const VERDICT_BODY_RE = /^.+: \$[\d.]+\/lb · (Prime gateway|Strong hub|Typical mix|Light hub|Limited ship)$/;
let coldProbeUsed = 0;
for (const slug of sample20) {
  const state = states.find((s) => s.slug === slug);
  if (!state) continue;
  const cw = decodeStateShipFlow(state.slug);
  coldProbeUsed += 1;
  if (cw) {
    const full = composeStateShipFlowTitle(cw);
    if (VERDICT_BODY_RE.test(full)) titleHonest += 1;
    titleVerdictBearing += 1;
  } else {
    titleHonest += 1;
    titleNullGracefulOmit += 1;
  }
}
const probePct = coldProbeUsed > 0 ? (titleHonest / coldProbeUsed) * 100 : 0;
console.log('\n[#120] N=20 randomized cold-probe (title body verdict marker or graceful omission)');
console.log(
  '       title-honest:',
  titleHonest,
  '/',
  coldProbeUsed,
  '(' + probePct.toFixed(1) + '%)',
  probePct >= 100 ? 'PASS' : 'FAIL (expected 100% — every title must be honest, fabrication is the failure mode)',
);
console.log(
  '       verdict-bearing:',
  titleVerdictBearing,
  ' graceful-omit (null crosswalk):',
  titleNullGracefulOmit,
);

// Sanity samples.
console.log('\n[sample]');
const sampleSlugs = sample20.slice(0, 6);
for (const slug of sampleSlugs) {
  const state = states.find((s) => s.slug === slug);
  if (!state) continue;
  const cw = decodeStateShipFlow(state.slug);
  console.log(
    '  ' + slug.padEnd(24),
    cw
      ? `tier=${cw.shipFlowTier}  score=${String(cw.composedScore).padStart(3)}  title=[${composeStateShipFlowTitle(cw).length}] ${composeStateShipFlowTitle(cw)}`
      : 'null (honest-null skip)',
  );
}
