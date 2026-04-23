import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug, getAvgGroundCostNational } from '@/lib/states-data';
import { breadcrumbSchema, faqSchema, webPageSchema } from '@/lib/schema';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AdSlot } from '@/components/AdSlot';
import { DataFeedback } from '@/components/DataFeedback';
import { FreshnessTag } from '@/components/FreshnessTag';
import { StateRich } from '@/components/state/StateRich';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};

  return {
    title: `Shipping Costs in ${state.name} — Hubs, Carriers & Ports`,
    description: `Average ground shipping in ${state.name} costs $${state.avgGroundCostLbs.toFixed(2)}/lb. Major hubs: ${state.shippingHubs.slice(0, 3).join(', ')}. USPS, UPS, FedEx presence, ports of entry, and shipping volume rank #${state.shippingVolumeRank}.`,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: { url: `/state/${slug}/` },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

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
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(
        `Shipping Costs in ${state.name}`,
        `Average ground shipping in ${state.name}: $${state.avgGroundCostLbs.toFixed(2)}/lb. Major hubs, carriers, and ports.`,
        `/state/${slug}/`,
      )) }} />

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'By State', href: '/state/' },
        { label: state.name },
      ]} />

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

    </div>
  );
}
