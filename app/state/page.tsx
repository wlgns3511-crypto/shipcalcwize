import type { Metadata } from 'next';
import { getAllStates, getAvgGroundCostNational } from '@/lib/states-data';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';
import { Breadcrumb } from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Shipping Costs by State — All 50 US States + DC',
  description: 'Compare domestic shipping costs, major shipping hubs, carrier presence, and ports of entry across all 50 US states and DC.',
  alternates: { canonical: '/state/' },
  openGraph: { url: '/state/' },
};

export default function StatesIndex() {
  const states = getAllStates();
  const nationalAvg = getAvgGroundCostNational();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListSchema(
              'US Shipping Costs by State',
              '/state/',
              states.map((s) => ({ name: s.name, url: `/state/${s.slug}/` })),
            ),
          ),
        }}
      />

      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'By State' }]} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Shipping Costs by US State</h1>
        <p className="text-slate-600 max-w-3xl">
          Compare average ground shipping costs, major shipping hubs, carrier presence, and ports
          of entry across all 50 US states and the District of Columbia. National average ground
          shipping cost: <strong>${nationalAvg.toFixed(2)}/lb</strong>.
        </p>
      </header>

      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-semibold">State</th>
              <th className="text-right px-3 py-2 font-semibold">Avg Ground $/lb</th>
              <th className="text-left px-3 py-2 font-semibold">Major Hubs</th>
              <th className="text-right px-3 py-2 font-semibold">Volume Rank</th>
              <th className="text-left px-3 py-2 font-semibold">Ports of Entry</th>
            </tr>
          </thead>
          <tbody>
            {states.map((s) => (
              <tr key={s.slug} className="border-b border-slate-100 hover:bg-amber-50">
                <td className="px-3 py-2">
                  <a href={`/state/${s.slug}/`} className="text-amber-700 hover:underline font-medium">
                    {s.name}
                  </a>
                  <span className="text-slate-400 ml-1 text-xs">{s.code}</span>
                </td>
                <td className={`px-3 py-2 text-right font-medium ${
                  s.avgGroundCostLbs > nationalAvg ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  ${s.avgGroundCostLbs.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-slate-600 text-xs">
                  {s.shippingHubs.slice(0, 3).join(', ')}
                </td>
                <td className="px-3 py-2 text-right text-slate-600">#{s.shippingVolumeRank}</td>
                <td className="px-3 py-2 text-slate-600 text-xs">
                  {s.portsOfEntry.length > 0 ? s.portsOfEntry.slice(0, 2).join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {states.map((s) => (
          <a
            key={s.slug}
            href={`/state/${s.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 p-4 transition-colors"
          >
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="font-bold text-slate-900">{s.name}</h2>
              <span className="text-xs text-slate-400">{s.code}</span>
            </div>
            <p className="text-sm text-slate-600">
              Avg ground: <span className="font-semibold text-amber-700">${s.avgGroundCostLbs.toFixed(2)}/lb</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {s.shippingHubs.slice(0, 3).join(', ')}
            </p>
          </a>
        ))}
      </section>

      <section className="p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Calculate your shipping cost</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/calculator/" className="text-amber-700 hover:underline font-medium">Shipping calculator →</a>
            <span className="text-slate-500"> estimate by weight, carrier, and destination</span>
          </li>
          {/* HCU 2026-04-25 — /compare/ 410'd. */}
        </ul>
      </section>
    </div>
  );
}
