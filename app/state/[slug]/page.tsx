import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug, getAvgGroundCostNational } from '@/lib/states-data';
import { breadcrumbSchema, datasetSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AdSlot } from '@/components/AdSlot';
import { DataFeedback } from '@/components/DataFeedback';
import { FreshnessTag } from '@/components/FreshnessTag';
import { StateRich } from '@/components/state/StateRich';
import { AuthorBox } from '@/components/AuthorBox';
import { getRoutesByOrigin, getAllCountries } from '@/lib/db';
import { formatCost } from '@/lib/format';
import { pickVariant } from '@/lib/content-helpers';
import { STATE_VINTAGE } from '@/lib/authorship';
import { classifyLandedCostTier, tierLabel, tierBlurb, tierToneColor, TIER_CUTOFF_SUMMARY } from '@/lib/landed-cost-tier';
import {
  decodeStateShipFlow,
  composeStateShipFlowTitle,
  composeStateShipFlowDescription,
  shipFlowMultiCreatorDatasetSchema,
} from '@/lib/crosswalk-shipflow';
import { CrosswalkBridge } from '@/components/upgrades/CrosswalkBridge';
import { StateHeroImage } from '@/components/StateHeroImage';
import { getStateImageByName } from '@/lib/state-images';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { TableOfContents } from '@/components/upgrades/TableOfContents';
import { InsightBlock } from '@/components/upgrades/InsightBlock';
import { ShippingCalculator } from '@/components/ShippingCalculator';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};

  // Phase 7 v2.3 §4.0 — title.absolute bypasses ` | ShipCalcWize` layout
  // suffix (15c ≥ 13c threshold). Legacy template title runs near or over
  // the 60c Google SERP cap on long state names (e.g., "Shipping Costs in
  // District of Columbia — Hubs, Carriers & Ports | ShipCalcWize" = 81c).
  // The composed verdict body alone is the SERP-visible title.
  const cw = decodeStateShipFlow(slug);
  if (cw) {
    return {
      title: { absolute: composeStateShipFlowTitle(cw) },
      description: composeStateShipFlowDescription(cw),
      alternates: { canonical: `/state/${slug}/` },
      openGraph: { url: `/state/${slug}/`, title: composeStateShipFlowTitle(cw) },
    };
  }

  // Honest-null fallback (no state currently triggers this — all 51 emit).
  return {
    title: `${state.name} shipping baseline`,
    description: `Average ground shipping in ${state.name} costs $${state.avgGroundCostLbs.toFixed(2)}/lb. Major hubs: ${state.shippingHubs.slice(0, 3).join(', ')}. USPS, UPS, FedEx presence, ports of entry, and shipping volume rank #${state.shippingVolumeRank}.`,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: { url: `/state/${slug}/` },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  // Phase 7 P0 — Ship-Flow Cross-Walk composite (BTS × USPS × CBP × UPU).
  const crosswalk = decodeStateShipFlow(slug);

  const allStates = getAllStates();
  const nationalAvg = getAvgGroundCostNational();
  const isAboveAvg = state.avgGroundCostLbs > nationalAvg;
  const diff = Math.abs(state.avgGroundCostLbs - nationalAvg);
  const diffPct = ((diff / nationalAvg) * 100).toFixed(1);

  const neighbors = allStates
    .filter((s) => s.slug !== state.slug)
    .sort((a, b) => Math.abs(a.shippingVolumeRank - state.shippingVolumeRank) - Math.abs(b.shippingVolumeRank - state.shippingVolumeRank))
    .slice(0, 6);

  const cheapest = allStates
    .filter((s) => s.slug !== state.slug)
    .sort((a, b) => a.avgGroundCostLbs - b.avgGroundCostLbs)
    .slice(0, 5);

  const countries = getAllCountries();
  const countryOptions = countries.map((c) => ({ code: c.code, name: c.name }));

  const insights = [
    {
      text: `At ${formatCost(state.avgGroundCostLbs)}/lb, ground shipping inside ${state.name} is ${isAboveAvg ? `${diffPct}% more expensive than` : `${diffPct}% cheaper than`} the national baseline of ${formatCost(nationalAvg)}/lb.`,
      sentiment: isAboveAvg ? "negative" as const : "positive" as const,
    },
    {
      text: `${state.name} ranks #${state.shippingVolumeRank} in the US for commercial freight volume. ${state.shippingVolumeRank <= 10 ? "Its top-tier volume density attracts competitive carrier pricing and more frequent pickup runs." : state.shippingVolumeRank <= 25 ? "This indicates a well-developed shipping infrastructure with solid carrier coverage." : "Lower commercial density can occasionally lead to slightly longer dispatch times or rural route surcharges."}`,
      sentiment: "neutral" as const,
    },
    {
      text: `${state.name}'s key transit points include ${state.shippingHubs.slice(0, 2).join(' and ')}${state.portsOfEntry.length > 0 ? `, backed by ${state.portsOfEntry.length} official ports of entry to handle cross-border and international cargo.` : ' serving as the main domestic sorting nodes.'}`,
      sentiment: "neutral" as const,
    },
  ];

  // Layer 1+ international destinations (HCU 2026-04-29) — top cheap export lanes from US.
  const usExportRoutes = getRoutesByOrigin('US');
  const topExportAir = [...usExportRoutes]
    .filter((r) => (r.avg_cost_kg_air ?? 0) > 0)
    .sort((a, b) => (a.avg_cost_kg_air ?? 0) - (b.avg_cost_kg_air ?? 0))
    .slice(0, 3);
  const topExportSea = [...usExportRoutes]
    .filter((r) => (r.avg_cost_kg_sea ?? 0) > 0)
    .sort((a, b) => (a.avg_cost_kg_sea ?? 0) - (b.avg_cost_kg_sea ?? 0))
    .slice(0, 3);

  // LandedCostTier — US-domestic ground variant. No customs/duty (domestic).
  // Reference: 5kg parcel × per-kg ground rate (state.avgGroundCostLbs converted lb→kg).
  // 1 lb ≈ 0.4536 kg → per-kg rate = per-lb / 0.4536.
  const stateGroundPerKg = state.avgGroundCostLbs / 0.4536;
  const stateLanded = classifyLandedCostTier({
    baselinePerKg: stateGroundPerKg,
    weightKg: 5,
    hsDutyPct: 0,
    processingFeeUsd: 0,
    mode: 'sea',
  });

  const hasSeaPort = state.portsOfEntry.some((p) => /port|harbor|seattle|long beach|los angeles|new york|new jersey|miami|houston|charleston|savannah|oakland/i.test(p));
  const hasAirHub = state.portsOfEntry.some((p) => /jfk|lax|atl|ord|airport|atlanta|chicago/i.test(p)) || state.shippingHubs.some((h) => /atlanta|memphis|louisville|cincinnati|los angeles/i.test(h));

  const stateNarrativeBank = hasSeaPort
    ? [
        `${state.name}'s ${state.portsOfEntry[0]} gateway anchors cheap sea export lanes — $${topExportSea[0]?.avg_cost_kg_sea?.toFixed(2) ?? '—'}/kg to ${topExportSea[0]?.dest_name ?? '—'} is among the lowest US-origin sea rates.`,
        `Sea freight via ${state.portsOfEntry[0]} pairs well with the ${topExportSea.slice(0, 3).map((r) => r.dest_name).join(', ')} lanes — pooled FCL/LCL economics dominate small-parcel air.`,
        `${state.name} shippers benefit from ${state.portsOfEntry[0]}'s direct sailings — air becomes worth the premium only on shipments under ~50 kg.`,
      ]
    : hasAirHub
    ? [
        `${state.name}'s air hub network (${state.shippingHubs.slice(0, 2).join(', ')}) keeps export air rates near $${topExportAir[0]?.avg_cost_kg_air?.toFixed(2) ?? '—'}/kg on the cheapest lanes — limited sea access offsets that with longer routing.`,
        `Air-hub access in ${state.shippingHubs[0]} means international parcels typically clear faster than from non-hub states; sea routing adds 5–7 transit days through gateway ports.`,
        `Major express carriers consolidate ${state.name} export volume through ${state.shippingHubs[0]}, keeping air rates competitive even for non-hub origins inside the state.`,
      ]
    : [
        `${state.name} routes most international shipments through gateway states — expect 1–2 extra transit days versus shipping directly from a port state.`,
        `Without a direct port of entry, ${state.name} exporters rely on consolidator pickup from ${state.shippingHubs[0]}; carrier-managed handoff to a gateway is usually cheaper than direct truck.`,
        `International freight from ${state.name} typically routes through a neighbor's port — comparing landed cost via the calculator catches the cross-state markup.`,
      ];

  const stateNarrative = pickVariant(stateNarrativeBank, slug);

  const faqs = [
    {
      question: `How much does ground shipping cost in ${state.name}?`,
      answer: `The average ground shipping cost in ${state.name} is $${state.avgGroundCostLbs.toFixed(2)} per pound, which is ${isAboveAvg ? `${diffPct}% above` : `${diffPct}% below`} the national average of $${nationalAvg.toFixed(2)}/lb. Actual rates depend on package dimensions, carrier, distance, and service level.`,
    },
    {
      question: `What are the major shipping hubs in ${state.name}?`,
      answer: `The major shipping hubs in ${state.name} are ${state.shippingHubs.join(', ')}. These cities serve as key distribution and logistics centers for USPS, UPS, and FedEx operations in the state.`,
    },
    {
      question: `Which carriers operate in ${state.name}?`,
      answer: `All major carriers operate in ${state.name}: ${state.carriers.usps ? 'USPS' : ''}${state.carriers.ups ? ', UPS' : ''}${state.carriers.fedex ? ', FedEx' : ''}. Each carrier has distribution centers and drop-off locations across ${state.shippingHubs[0]} and other major cities.`,
    },
    ...(state.portsOfEntry.length > 0
      ? [{
          question: `What ports of entry does ${state.name} have?`,
          answer: `${state.name} has ${state.portsOfEntry.length} port${state.portsOfEntry.length > 1 ? 's' : ''} of entry: ${state.portsOfEntry.join(', ')}. These handle international imports including containerized cargo, air freight, and cross-border ground shipments.`,
        }]
      : []),
    {
      question: `How does ${state.name} rank for shipping volume?`,
      answer: `${state.name} ranks #${state.shippingVolumeRank} out of 51 (50 states + DC) for total shipping volume. ${state.shippingVolumeRank <= 10 ? 'As a top-10 shipping state, it benefits from dense carrier networks and competitive rates.' : state.shippingVolumeRank <= 25 ? 'It has moderate shipping infrastructure with good carrier coverage.' : 'Lower volume can mean slightly higher per-unit shipping costs due to less dense carrier routes.'}`,
    },
  ];

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
    { name: state.name, url: `/state/${slug}/` },
  ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(
        `Shipping Costs in ${state.name}`,
        `Average ground shipping in ${state.name}: $${state.avgGroundCostLbs.toFixed(2)}/lb. Major hubs, carriers, and ports.`,
        `/state/${slug}/`,
      )) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(
        `Shipping baselines: ${state.name} (US)`,
        `Domestic ground shipping $/lb, USPS/UPS/FedEx carrier presence, ports of entry, and shipping volume rank for ${state.name}.`,
        {
          spatialCoverage: `${state.name}, USA`,
          variableMeasured: [
            'Avg ground $/lb',
            'Carrier presence (USPS, UPS, FedEx)',
            'Shipping hubs',
            'Ports of entry',
            'Shipping volume rank',
          ],
          vintage: STATE_VINTAGE,
        }
      )) }} />
      {/* Phase 7 P4 — multi-creator Ship-Flow Dataset @graph (BTS + USPS + CBP + UPU). */}
      {crosswalk && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(shipFlowMultiCreatorDatasetSchema({
            cw: crosswalk,
            urlPath: `/state/${slug}/`,
            dateModified: STATE_VINTAGE,
            siteDomain: 'shipcalcwize.com',
          })),
        }} />
      )}

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'By State', href: '/state/' },
        { label: state.name },
      ]} />


      {(() => { const stateImage = getStateImageByName(state.name); return stateImage ? <StateHeroImage img={stateImage} /> : null; })()}

      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-3 text-amber-900">
          Shipping Costs in {state.name}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Average ground shipping in {state.name} ({state.code}) costs{' '}
          <strong className="text-amber-700">${state.avgGroundCostLbs.toFixed(2)}/lb</strong>,{' '}
          {isAboveAvg ? (
            <span className="text-red-600">{diffPct}% above</span>
          ) : (
            <span className="text-emerald-600">{diffPct}% below</span>
          )}{' '}
          the national average. Shipping volume rank: <strong>#{state.shippingVolumeRank}</strong> of 51.
        </p>
      </section>

      <TrustBlock
        sources={[
          { name: 'Bureau of Transportation Statistics (BTS)', url: 'https://www.bts.gov/' },
          { name: 'USPS Zone Rate Tables', url: 'https://pe.usps.com/' },
          { name: 'US Customs and Border Protection (CBP)', url: 'https://www.cbp.gov/' },
          { name: 'Universal Postal Union (UPU)', url: 'https://www.upu.int/' }
        ]}
        updated={STATE_VINTAGE}
      />

      <TableOfContents />

      <InsightBlock
        entityName={state.name}
        insights={insights}
      />

      {/* Phase 7 P0 — Ship-Flow cross-walk verdict strip (BTS × USPS × CBP × UPU) */}
      {crosswalk && (
        <section
          data-upgrade="ship-flow-crosswalk"
          className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/40 px-5 py-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h2 className="text-base font-bold text-indigo-900 m-0">
              Ship-Flow Cross-Walk — {crosswalk.stateName}
            </h2>
            <p className="text-xs text-slate-500 m-0">
              BTS volume × USPS rate sheets × CBP ports × UPU cross-border framework
            </p>
          </div>
          <p className="text-2xl font-bold text-indigo-800 m-0 mt-1">
            {crosswalk.shipFlowTierLabel} ({crosswalk.composedScore}/100)
          </p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{crosswalk.decoderNotes}</p>
          <dl className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-slate-500 uppercase tracking-wider">Ground baseline</dt>
              <dd className="font-semibold text-slate-800">
                ${crosswalk.groundCostPerLbUsd.toFixed(2)}/lb
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 uppercase tracking-wider">vs national</dt>
              <dd className="font-semibold text-slate-800">
                {crosswalk.groundCostDeltaPct >= 0 ? '+' : ''}
                {crosswalk.groundCostDeltaPct.toFixed(1)}%
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 uppercase tracking-wider">Volume rank (BTS)</dt>
              <dd className="font-semibold text-slate-800">
                #{crosswalk.volumeRank} of {crosswalk.totalStates}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 uppercase tracking-wider">CBP ports of entry</dt>
              <dd className="font-semibold text-slate-800">
                {crosswalk.portCount}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 uppercase tracking-wider">Sea port</dt>
              <dd className="font-semibold text-slate-800">
                {crosswalk.hasSeaPort ? 'Yes' : 'No'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 uppercase tracking-wider">Air hub</dt>
              <dd className="font-semibold text-slate-800">
                {crosswalk.hasAirHub ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* LandedCostTier — US-domestic ground variant (PSU 0차 2026-05-11) */}
      <section
        data-upgrade="landed-cost-tier"
        className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold text-amber-900 m-0">
            Landed cost tier — {state.name} (domestic ground)
          </h2>
          <p className="text-xs text-slate-500 m-0">
            5 kg parcel · domestic ground · no customs duty
          </p>
        </div>
        {(() => {
          const tone = tierToneColor(stateLanded.tier);
          return (
            <div
              data-upgrade="landed-cost-tier-domestic"
              className={`rounded-md border bg-white px-4 py-3 border-${tone}-200`}
            >
              <p className={`text-xl font-bold text-${tone}-700 m-0`}>
                {tierLabel(stateLanded.tier)}
              </p>
              {stateLanded.totalCostUsd != null && (
                <p className="text-sm text-slate-700 m-0 mt-1">
                  ≈ ${stateLanded.totalCostUsd.toFixed(2)} for a 5 kg parcel ·{' '}
                  ${stateGroundPerKg.toFixed(2)}/kg ground baseline (USPS, UPS, FedEx aggregated)
                </p>
              )}
              <p className="text-sm text-slate-600 m-0 mt-2">{tierBlurb(stateLanded.tier)}</p>
            </div>
          );
        })()}
        <details className="mt-3 text-sm text-slate-600">
          <summary className="cursor-pointer text-amber-700 hover:underline">
            How this differs from the international tier
          </summary>
          <div className="mt-2 space-y-2">
            <p className="m-0">
              <strong>Domestic ground.</strong> US-domestic parcels do not clear US CBP and
              are not assessed WCO HS duty or Section 321 processing fees — so the
              domestic tier reflects only the ground shipping baseline, not the full
              international landed cost. Compare with any{' '}
              <a href="/country/" className="text-amber-700 hover:underline">
                country page
              </a>{' '}
              to see the duty layer.
            </p>
            <p className="m-0">
              <strong>Five tiers.</strong>{' '}
              {TIER_CUTOFF_SUMMARY.map((row) =>
                row.highUsd
                  ? `Tier ${row.tier} (${row.label}) $${row.lowUsd}–$${row.highUsd}`
                  : `Tier ${row.tier} (${row.label}) $${row.lowUsd}+`,
              ).join(' · ')}
              . Full methodology at{' '}
              
              .
            </p>
            <p className="m-0 text-slate-500">
              <strong>Not included.</strong> Fuel surcharge, residential surcharge, address
              correction fee, dimensional weight overrides, and last-mile zone tables.
              Confirm with the carrier before booking.
            </p>
          </div>
        </details>
      </section>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Ground Cost</p>
          <p className="text-2xl font-bold text-amber-700">${state.avgGroundCostLbs.toFixed(2)}</p>
          <p className="text-xs text-slate-500">per lb</p>
        </div>
        <div className={`${isAboveAvg ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'} border rounded-lg p-4 text-center`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider">vs National Avg</p>
          <p className={`text-2xl font-bold ${isAboveAvg ? 'text-red-600' : 'text-emerald-600'}`}>
            {isAboveAvg ? '+' : '-'}{diffPct}%
          </p>
          <p className="text-xs text-slate-500">${nationalAvg.toFixed(2)}/lb avg</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Volume Rank</p>
          <p className="text-2xl font-bold text-blue-700">#{state.shippingVolumeRank}</p>
          <p className="text-xs text-slate-500">of 51</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Shipping Hubs</p>
          <p className="text-2xl font-bold text-slate-700">{state.shippingHubs.length}</p>
          <p className="text-xs text-slate-500">major cities</p>
        </div>
      </div>

      {/* Major Shipping Hubs */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Major Shipping Hubs in {state.name}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.shippingHubs.map((hub) => (
            <div key={hub} className="border border-slate-200 rounded-lg p-4 hover:border-amber-300 transition-colors">
              <p className="font-semibold text-amber-800">{hub}</p>
              <p className="text-xs text-slate-500 mt-1">
                USPS, UPS, FedEx distribution center
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdSlot id="3456789010" />

      {/* Carrier Presence */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Carrier Presence in {state.name}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={`border rounded-lg p-4 ${state.carriers.usps ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
            <p className="font-semibold text-blue-800">USPS</p>
            <p className="text-sm text-slate-600 mt-1">
              {state.carriers.usps ? `Full service across ${state.name}. Best for lightweight packages under 1 lb. Priority Mail and First-Class options available at all post offices.` : 'Limited service'}
            </p>
          </div>
          <div className={`border rounded-lg p-4 ${state.carriers.ups ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
            <p className="font-semibold text-amber-800">UPS</p>
            <p className="text-sm text-slate-600 mt-1">
              {state.carriers.ups ? `Full ground and air network in ${state.name}. UPS Ground typically 1-5 business days for domestic. Strong commercial and business shipping presence.` : 'Limited service'}
            </p>
          </div>
          <div className={`border rounded-lg p-4 ${state.carriers.fedex ? 'border-purple-200 bg-purple-50' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
            <p className="font-semibold text-purple-800">FedEx</p>
            <p className="text-sm text-slate-600 mt-1">
              {state.carriers.fedex ? `Full Express and Ground service in ${state.name}. FedEx Ground 1-5 days, Express overnight available. SmartPost for lightweight ecommerce.` : 'Limited service'}
            </p>
          </div>
        </div>
      </section>

      {/* Top international export lanes (HCU 2026-04-29 Layer 1+). */}
      {(topExportAir.length > 0 || topExportSea.length > 0) && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Cheapest international export lanes from {state.name}</h2>
          <p className="text-sm text-slate-600 mb-3">{stateNarrative}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {topExportAir.length > 0 && (
              <div>
                <h3 className="font-semibold text-amber-700 mb-2 text-sm">Top 3 cheapest by air (US-origin)</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 font-semibold">Destination</th>
                      <th className="text-right px-3 py-2 font-semibold">$/kg</th>
                      <th className="text-right px-3 py-2 font-semibold">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topExportAir.map((r) => (
                      <tr key={`exp-air-${r.dest_slug}`} className="border-b border-slate-100 hover:bg-amber-50">
                        <td className="px-3 py-2"><a href={`/country/${r.dest_slug}/`} className="text-amber-700 hover:underline font-medium">{r.dest_name}</a></td>
                        <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_air)}</td>
                        <td className="px-3 py-2 text-right">{r.avg_days_air}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {topExportSea.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-700 mb-2 text-sm">Top 3 cheapest by sea (US-origin)</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 font-semibold">Destination</th>
                      <th className="text-right px-3 py-2 font-semibold">$/kg</th>
                      <th className="text-right px-3 py-2 font-semibold">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topExportSea.map((r) => (
                      <tr key={`exp-sea-${r.dest_slug}`} className="border-b border-slate-100 hover:bg-blue-50">
                        <td className="px-3 py-2"><a href={`/country/${r.dest_slug}/`} className="text-blue-700 hover:underline font-medium">{r.dest_name}</a></td>
                        <td className="px-3 py-2 text-right">{formatCost(r.avg_cost_kg_sea)}</td>
                        <td className="px-3 py-2 text-right">{r.avg_days_sea}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Lane economics use US-origin baselines; per-state surcharges (drayage, last-mile to gateway) typically add $0.30–$0.70/kg to the rate above.
          </p>
        </section>
      )}

      {/* Ports of Entry */}
      {state.portsOfEntry.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Ports of Entry in {state.name}</h2>
          <div className="border border-slate-200 rounded-lg p-5">
            <p className="text-sm text-slate-600 mb-3">
              {state.name} has {state.portsOfEntry.length} port{state.portsOfEntry.length > 1 ? 's' : ''} of entry
              handling international shipments, containerized cargo, and cross-border freight.
            </p>
            <ul className="space-y-2">
              {state.portsOfEntry.map((port) => (
                <li key={port} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{port}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <AdSlot id="3456789011" />

      {/* Shipping Context */}
      <section className="mb-10 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold mb-2">Shipping to and from {state.name}</h2>
        <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
          {state.shippingVolumeRank <= 10 ? (
            <p>
              {state.name} is one of the top 10 shipping states by volume, which means dense carrier networks,
              frequent pickup schedules, and generally competitive rates. High-volume lanes like{' '}
              {state.shippingHubs[0]} to major metros typically get the best negotiated rates from all three
              major carriers.
            </p>
          ) : state.shippingVolumeRank <= 25 ? (
            <p>
              {state.name} has moderate shipping volume with solid carrier infrastructure. Rates are close to
              national averages, and all major carriers maintain full service networks. Businesses in{' '}
              {state.shippingHubs[0]} benefit from proximity to regional distribution centers.
            </p>
          ) : (
            <p>
              {state.name} has lower shipping volume relative to major logistics states. This can mean slightly
              higher per-unit costs and fewer same-day pickup windows in rural areas. However, all three major
              carriers still provide full coverage, and rates from {state.shippingHubs[0]} are competitive for
              standard ground service.
            </p>
          )}
          <p>
            For international shipments originating from {state.name},{' '}
            {state.portsOfEntry.length > 0
              ? `goods can be exported through ${state.portsOfEntry[0]}. `
              : `goods typically route through the nearest major port. `}
            Compare international rates using our{' '}
            <a href="/calculator/" className="text-amber-600 hover:underline font-medium">shipping calculator</a>.
          </p>
        </div>
      </section>

      {/* Shipping Calculator */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Calculate International Shipping from {state.name}</h2>
        <ShippingCalculator countries={countryOptions} defaultOrigin="US" />
      </section>

      {/* Similar states */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Similar Shipping States</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {neighbors.map((s) => (
            <a
              key={s.slug}
              href={`/state/${s.slug}/`}
              className="block border border-slate-200 rounded-lg p-3 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <p className="font-semibold text-sm text-amber-800">{s.name}</p>
              <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                <p>Avg ground: ${s.avgGroundCostLbs.toFixed(2)}/lb</p>
                <p>Volume rank: #{s.shippingVolumeRank}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Cheapest states */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Cheapest US States for Shipping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 font-semibold">Rank</th>
                <th className="text-left px-3 py-2 font-semibold">State</th>
                <th className="text-right px-3 py-2 font-semibold">Avg Ground $/lb</th>
                <th className="text-right px-3 py-2 font-semibold">Volume Rank</th>
              </tr>
            </thead>
            <tbody>
              {cheapest.map((s, i) => (
                <tr key={s.slug} className="border-b border-slate-100 hover:bg-amber-50">
                  <td className="px-3 py-2 font-medium">{i + 1}</td>
                  <td className="px-3 py-2">
                    <a href={`/state/${s.slug}/`} className="text-amber-700 hover:underline font-medium">{s.name}</a>
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-medium">${s.avgGroundCostLbs.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">#{s.shippingVolumeRank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-1">{faq.question}</h3>
              <p className="text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <DataFeedback />
      <FreshnessTag source="Published carrier rate cards + USPS, UPS, FedEx zone pricing" />

      <StateRich slug={slug} state={state} />

      {/* Phase 7 P5 — Internal Cross-Walk Bridge (4 portfolio siblings join on state slug). */}
      <CrosswalkBridge crosswalk={crosswalk} stateSlug={slug} />

      <AuthorBox
        vintage={STATE_VINTAGE}
        source={`${state.name} ground-shipping baseline`}
      />

    </main>
  );
}
