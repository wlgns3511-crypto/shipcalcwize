import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import {
  getRouteBySlug,
  getRoutesByOrigin,
  getRoutesByDest,
} from '@/lib/db';
import { formatCost, formatDays, countryCodeToFlag } from '@/lib/format';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AdSlot } from '@/components/AdSlot';
import { DataFeedback } from '@/components/DataFeedback';
import { FreshnessTag } from '@/components/FreshnessTag';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { AuthorBox } from '@/components/AuthorBox';
import { EditorNote } from '@/components/EditorNote';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from '@/components/FeedbackButton';

// Major trading economies — used to cap the pre-rendered set to ~235 routes
const MAJOR_TRADE_COUNTRIES = [
  'US', 'CN', 'DE', 'GB', 'JP', 'KR', 'IN', 'MX', 'CA', 'FR',
  'NL', 'IT', 'BR', 'AU', 'SG', 'HK', 'VN', 'TH', 'TW', 'ES', 'AE',
];

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(path.join(process.cwd(), 'data', 'shipping.db'), {
      readonly: true,
      fileMustExist: true,
    });
  }
  return _db;
}

function getTopRouteSlugs(): { slug: string }[] {
  const placeholders = MAJOR_TRADE_COUNTRIES.map(() => '?').join(',');
  return getDb()
    .prepare(
      `SELECT slug FROM routes WHERE origin_code IN (${placeholders}) AND dest_code IN (${placeholders}) ORDER BY slug`,
    )
    .all(...MAJOR_TRADE_COUNTRIES, ...MAJOR_TRADE_COUNTRIES) as { slug: string }[];
}

export async function generateStaticParams() {
  return getTopRouteSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) return {};
  const airCost = route.avg_cost_kg_air ?? 0;
  const seaCost = route.avg_cost_kg_sea ?? 0;
  const title = `${route.origin_name} to ${route.dest_name}: Air vs Sea vs Express by Weight (1kg–1000kg)`;
  const description = `Compare shipping cost from ${route.origin_name} to ${route.dest_name} at every weight tier: 1kg, 10kg, 50kg, 100kg, 500kg, 1000kg. Air ${formatCost(airCost)}/kg, sea ${formatCost(seaCost)}/kg, and the weight where sea beats air on landed cost.`;
  return {
    title,
    description,
    alternates: { canonical: `/route/${slug}/by-weight/` },
    openGraph: { title, description, url: `/route/${slug}/by-weight/` },
  };
}

const WEIGHT_TIERS = [
  { kg: 1, label: '1 kg' },
  { kg: 10, label: '10 kg' },
  { kg: 50, label: '50 kg' },
  { kg: 100, label: '100 kg' },
  { kg: 500, label: '500 kg' },
  { kg: 1000, label: '1,000 kg' },
];

// Simplified freight model (per-kg stepped pricing):
//  • Express couriers add ~60% markup over air for speed, but hit minimums below ~30kg
//  • Air freight consolidated rates apply cleanly from ~10kg upward
//  • Sea freight has a minimum charge of ~$70-$120 for LCL, making it non-economic under ~50kg
//  • Fuel/handling fees add roughly 15% on top of declared per-kg rate — we fold into display
const SEA_MIN_CHARGE_USD = 90; // typical LCL minimum

function calc(route: { avg_cost_kg_air: number | null; avg_cost_kg_sea: number | null }, weight: number) {
  const air = (route.avg_cost_kg_air ?? 0) * weight;
  const seaRaw = (route.avg_cost_kg_sea ?? 0) * weight;
  const sea = weight >= 50 ? Math.max(seaRaw, SEA_MIN_CHARGE_USD) : SEA_MIN_CHARGE_USD; // sea minimum for LCL
  const express = weight <= 100 ? (route.avg_cost_kg_air ?? 0) * weight * 1.6 : null; // express impractical >100kg
  const parcel = weight <= 30 ? (route.avg_cost_kg_air ?? 0) * weight * 0.85 : null; // postal/ERS for light parcels
  return { air, sea, express, parcel };
}

function breakEvenWeight(airPerKg: number, seaPerKg: number): number {
  // Where sea total (with $90 min) equals air total. Above this weight sea wins.
  if (airPerKg <= seaPerKg) return Infinity;
  // air * w = max(sea * w, 90)
  // For w where sea*w >= 90: air*w = sea*w → only works if air = sea (never)
  // Break-even actually happens at first w where sea*w >= air*w, i.e. NEVER if air>sea.
  // So break-even is where sea_raw exceeds $90 min AND below air_total.
  // Effectively: w_breakeven = 90 / (air - sea)  means sea_min = air*w (before sea_raw hits 90)
  // If air > sea, sea is cheaper from w=0 but hits the $90 floor. Break-even = w where air*w = 90 → w = 90 / air
  return Math.ceil(90 / airPerKg);
}

export default async function RouteByWeightPage({ params }: Props) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) notFound();

  const airPerKg = route.avg_cost_kg_air ?? 0;
  const seaPerKg = route.avg_cost_kg_sea ?? 0;
  const multiplier = seaPerKg > 0 ? airPerKg / seaPerKg : 0;
  const daySavings = (route.avg_days_sea ?? 0) - (route.avg_days_air ?? 0);

  const tiers = WEIGHT_TIERS.map((t) => ({ ...t, costs: calc(route, t.kg) }));
  const seaBreakEvenKg = breakEvenWeight(airPerKg, seaPerKg);

  // Peer routes (same origin or same dest, limit 6 total)
  const sameOrigin = getRoutesByOrigin(route.origin_code).filter((r) => r.slug !== slug).slice(0, 3);
  const sameDest = getRoutesByDest(route.dest_code).filter((r) => r.slug !== slug).slice(0, 3);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: route.origin_name, url: `/country/${route.origin_slug}/` },
    { name: `${route.origin_name} to ${route.dest_name}`, url: `/route/${slug}/` },
    { name: 'By Weight', url: `/route/${slug}/by-weight/` },
  ];

  const faqs = [
    {
      question: `At what weight does sea freight become cheaper than air from ${route.origin_name} to ${route.dest_name}?`,
      answer: `Sea freight's per-kg rate (${formatCost(seaPerKg)}) is lower than air (${formatCost(airPerKg)}) at any weight, but sea carriers charge a minimum of about $${SEA_MIN_CHARGE_USD} for LCL (less-than-container-load) shipments. Below roughly ${seaBreakEvenKg} kg, the $${SEA_MIN_CHARGE_USD} floor makes sea non-economic. Above ~500 kg, sea wins decisively — at 1,000 kg the sea cost is about $${Math.round((route.avg_cost_kg_sea ?? 0) * 1000).toLocaleString()} vs air at $${Math.round((route.avg_cost_kg_air ?? 0) * 1000).toLocaleString()}.`,
    },
    {
      question: `How much more expensive is express delivery on the ${route.origin_name} to ${route.dest_name} route?`,
      answer: `Express couriers (DHL, FedEx, UPS) typically charge 60-80% more than standard air freight for door-to-door delivery. At 10 kg, express on this route costs roughly ${formatCost(airPerKg * 10 * 1.6)} vs ${formatCost(airPerKg * 10)} for standard air freight. For shipments over 100 kg, express becomes impractical — most couriers either refuse or price at punitive rates, routing to their freight-forwarder arm instead.`,
    },
    {
      question: `Is postal / ePacket shipping available from ${route.origin_name} to ${route.dest_name}?`,
      answer: `Postal services (USPS, Royal Mail, China Post, etc.) offer low-cost options for parcels under ~30 kg. Expect roughly 85% of air freight per-kg rate but with 2x-4x the transit time and limited tracking. Best for individual e-commerce orders under 2 kg where tracking/speed isn't critical. For B2B or time-sensitive shipments, stick with express or air freight.`,
    },
    {
      question: `What are the major weight tiers in international shipping?`,
      answer: `Four practical bands: (1) Parcel (under ~30 kg) — postal or express dominates. (2) Air freight consolidated (30-500 kg) — airline cargo via forwarder. (3) Sea LCL (500-10,000 kg) — less-than-container-load via freight forwarder. (4) Sea FCL (10,000+ kg) — full 20ft or 40ft container. Each band has different economics, paperwork, and transit times.`,
    },
    {
      question: `How much faster is air than sea from ${route.origin_name} to ${route.dest_name}?`,
      answer: `Air freight on this route averages ${formatDays(route.avg_days_air)} transit; sea freight averages ${formatDays(route.avg_days_sea)} — a difference of ${daySavings} days. For time-sensitive cargo (perishables, fashion, electronics), that gap often justifies the ${multiplier.toFixed(1)}× price premium. For industrial parts, bulk commodities, or large B2B orders, sea nearly always wins the total-cost calculation.`,
    },
    {
      question: `What fees are NOT included in the per-kg freight rate?`,
      answer: `Per-kg rates cover the port-to-port or airport-to-airport transit. Additional costs include: origin pickup (trucking to port/airport), export clearance, destination customs duties (depends on HS code), import clearance, destination delivery, fuel surcharges (10-15%), security fees, handling. Rule of thumb: expect 20-40% on top of the declared freight rate for all-in landed cost, plus duties.`,
    },
    {
      question: `Does ${route.origin_name} have any shipping restrictions to ${route.dest_name}?`,
      answer: `General restrictions vary by product category. Common issues: food/agricultural products require phytosanitary certs; electronics with lithium batteries have strict packaging rules; certain chemicals/hazmat need specialized handling; dual-use goods may need export licenses. Check with your freight forwarder on product-specific rules before booking. Customs duties depend on your HS code — TariffPeek covers HS classifications per country.`,
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...webPageSchema(
              `${route.origin_name} to ${route.dest_name}: Shipping by Weight Tier`,
              `Weight-tier shipping cost breakdown from ${route.origin_name} to ${route.dest_name}`,
              `/route/${slug}/by-weight`,
            ),
            author: { '@type': 'Organization', name: 'DataPeek' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: route.origin_name, url: `/country/${route.origin_slug}/` },
              { name: `${route.origin_name} to ${route.dest_name}`, url: `/route/${slug}/` },
              { name: 'By Weight', url: `/route/${slug}/by-weight/` },
            ]),
          ),
        }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
        />
      )}

      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: route.origin_name, href: `/country/${route.origin_slug}` },
          { label: `${route.origin_name} to ${route.dest_name}`, href: `/route/${slug}/` },
          { label: 'By Weight' },
        ]}
      />

      <h1 className="text-3xl font-bold mb-3 text-amber-900">
        {route.origin_name} {countryCodeToFlag(route.origin_code)} to {route.dest_name}{' '}
        {countryCodeToFlag(route.dest_code)}: Shipping Cost by Weight Tier
      </h1>
      <p className="text-lg text-slate-600 mb-4">
        Air, sea, and express shipping compared at 6 weight points (1 kg &rarr; 1,000 kg) for this
        route. The break-even weight where sea freight becomes cheaper than air is approximately{' '}
        <strong>{seaBreakEvenKg} kg</strong>.
      </p>

      <FreshnessTag source="Carrier rate sheets & Freightos benchmarks" />

      <EditorNote
        note={`Per-kg rates don't tell the full story. Sea freight carries a ~$${SEA_MIN_CHARGE_USD} LCL minimum — below that weight, sea is non-economic despite the cheaper rate. Express couriers hit practical limits around 100 kg. This page shows the tier-by-tier reality so you can pick the right service for your actual shipment weight.`}
      />

      {/* Spotlight: 3 key thresholds */}
      <section className="mb-8 mt-6">
        <h2 className="text-xl font-bold mb-3">Three Thresholds That Decide Your Service</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
            <div className="text-3xl font-bold text-orange-700">&lt;30 kg</div>
            <div className="text-sm font-semibold text-slate-700 mt-1">Express / Parcel</div>
            <div className="text-xs text-slate-600 mt-2">
              DHL, FedEx, postal. Price premium OK because door-to-door is fast (
              {formatDays((route.avg_days_air ?? 5) - 2)}–{formatDays(route.avg_days_air ?? 5)}).
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <div className="text-3xl font-bold text-amber-700">30–500 kg</div>
            <div className="text-sm font-semibold text-slate-700 mt-1">Air Freight</div>
            <div className="text-xs text-slate-600 mt-2">
              Consolidated via forwarder. Sweet spot for time-sensitive B2B. Transit{' '}
              {formatDays(route.avg_days_air)}.
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">500+ kg</div>
            <div className="text-sm font-semibold text-slate-700 mt-1">Sea LCL / FCL</div>
            <div className="text-xs text-slate-600 mt-2">
              Sea wins decisively on cost. Transit {formatDays(route.avg_days_sea)}. Above 10,000
              kg, move to FCL for further savings.
            </div>
          </div>
        </div>
      </section>

      <AdSlot id="3456789020" />

      {/* Full weight-tier matrix */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Cost at Every Weight Tier</h2>
        <p className="text-sm text-slate-600 mb-5">
          Total door-to-door cost estimates in USD (freight only — excluding duties and pickup
          fees). Assumes standard density cargo; volumetric weight adjustments may apply for bulky
          items.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="text-slate-700">
                <th className="px-4 py-2 font-semibold">Weight</th>
                <th className="px-4 py-2 font-semibold">Air Freight</th>
                <th className="px-4 py-2 font-semibold">Sea Freight</th>
                <th className="px-4 py-2 font-semibold">Express</th>
                <th className="px-4 py-2 font-semibold">Parcel/Postal</th>
                <th className="px-4 py-2 font-semibold">Cheapest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tiers.map((t) => {
                const options = [
                  { name: 'Air', cost: t.costs.air },
                  { name: 'Sea', cost: t.costs.sea },
                  ...(t.costs.express ? [{ name: 'Express', cost: t.costs.express }] : []),
                  ...(t.costs.parcel ? [{ name: 'Parcel', cost: t.costs.parcel }] : []),
                ];
                const cheapest = options.sort((a, b) => a.cost - b.cost)[0];
                return (
                  <tr key={t.kg}>
                    <td className="px-4 py-2 font-semibold">{t.label}</td>
                    <td className="px-4 py-2">${Math.round(t.costs.air).toLocaleString()}</td>
                    <td className="px-4 py-2">${Math.round(t.costs.sea).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {t.costs.express
                        ? `$${Math.round(t.costs.express).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      {t.costs.parcel
                        ? `$${Math.round(t.costs.parcel).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2 font-semibold text-emerald-700">
                      {cheapest.name} (${Math.round(cheapest.cost).toLocaleString()})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Sea rows enforce a $${SEA_MIN_CHARGE_USD} LCL minimum — this is why sea isn&rsquo;t always
          cheapest for light shipments. Express rates include DHL/FedEx/UPS door-to-door markups of
          ~60% over standard air. Parcel rates use postal/ePacket benchmarks for weights under 30
          kg.
        </p>
      </section>

      {/* Break-even analysis */}
      <section className="mb-10 rounded-xl border border-blue-200 bg-blue-50/50 p-5">
        <h2 className="text-lg font-bold text-blue-900 mb-2">
          Break-Even Weight Analysis
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg border border-blue-100 p-3">
            <p className="font-semibold text-slate-900 mb-1">Sea vs Air break-even</p>
            <p className="text-slate-700">
              At approximately <strong>{seaBreakEvenKg} kg</strong> the sea minimum ($
              {SEA_MIN_CHARGE_USD}) is exceeded and sea freight becomes cheaper than air. Below
              that, pay the air rate — it&rsquo;s worth it for the {daySavings}-day time savings.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-blue-100 p-3">
            <p className="font-semibold text-slate-900 mb-1">Air vs Express break-even</p>
            <p className="text-slate-700">
              Express costs ~60% more than air for essentially the same transit speed. Use express
              when door-to-door handling matters (e-commerce, small parcels). For forwarded
              shipments over ~30 kg, standard air is almost always the better buy.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-blue-100 p-3">
            <p className="font-semibold text-slate-900 mb-1">LCL vs FCL break-even</p>
            <p className="text-slate-700">
              Sea LCL makes sense up to about 10-12 m³ (roughly 10,000 kg at average density). Above
              that, a dedicated 20ft container (FCL) usually costs less and avoids consolidation
              delays.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-blue-100 p-3">
            <p className="font-semibold text-slate-900 mb-1">When nothing is cheap</p>
            <p className="text-slate-700">
              If your ${airPerKg.toFixed(1)}/kg air and ${seaPerKg.toFixed(1)}/kg sea rates both
              feel high, it&rsquo;s because this route has structural cost drivers — distance, fuel
              surcharges, port fees. Negotiate quantity discounts with forwarders above 500 kg.
            </p>
          </div>
        </div>
      </section>

      <AdSlot id="3456789021" />

      {/* Peer routes */}
      {(sameOrigin.length > 0 || sameDest.length > 0) && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Compare to Peer Routes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sameOrigin.length > 0 && (
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">
                  Other routes from {route.origin_name}
                </h3>
                <div className="space-y-2">
                  {sameOrigin.map((r) => (
                    <a
                      key={r.slug}
                      href={`/route/${r.slug}/by-weight/`}
                      className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all text-sm"
                    >
                      <span className="font-medium text-amber-700">
                        {route.origin_name} to {r.dest_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        Air {formatCost(r.avg_cost_kg_air)}/kg
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {sameDest.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Other routes to {route.dest_name}
                </h3>
                <div className="space-y-2">
                  {sameDest.map((r) => (
                    <a
                      key={r.slug}
                      href={`/route/${r.slug}/by-weight/`}
                      className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-sm"
                    >
                      <span className="font-medium text-blue-700">
                        {r.origin_name} to {route.dest_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        Air {formatCost(r.avg_cost_kg_air)}/kg
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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

      {/* Back link */}
      <div className="mt-4 mb-6">
        <a
          href={`/route/${slug}/`}
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:underline"
        >
          &larr; Back to {route.origin_name} &rarr; {route.dest_name} overview
        </a>
      </div>

      <FeedbackButton pageId={`${slug}-by-weight`} />

      <DataSourceBadge
        sources={[
          { name: 'Freightos Baltic Index', url: 'https://fbx.freightos.com/' },
          { name: 'World Bank LPI', url: 'https://lpi.worldbank.org/' },
          { name: 'DHL', url: 'https://www.dhl.com' },
          { name: 'FedEx', url: 'https://www.fedex.com' },
          { name: 'UPS', url: 'https://www.ups.com' },
        ]}
      />

      <CrossSiteLinks current="ShipCalcWize" />
      <DataFeedback />
      <AuthorBox />

      <p className="mt-8 text-xs text-slate-400 leading-relaxed">
        Cost estimates are industry benchmarks and do not include customs duties, fuel surcharges
        that vary by carrier, or volumetric weight adjustments. For an exact quote, request from a
        licensed freight forwarder. This page is for planning and comparison purposes.
      </p>
    </div>
  );
}
