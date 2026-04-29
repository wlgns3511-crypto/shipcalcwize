import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllInsightArticles } from '@/lib/insight-articles';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { DATA_LAST_UPDATED } from '@/lib/data-updated';

const SITE_URL = 'https://shipcalcwize.com';

export const metadata: Metadata = {
  title: 'Shipping Cost Insights — Data-Driven Rate Analysis',
  description: 'Expert analysis of shipping cost trends, carrier rate comparisons, and data-driven insights for shippers. Based on current rate data from USPS, FedEx, and UPS.',
  alternates: { canonical: '/insights/' },
  openGraph: { title: 'Shipping Cost Insights', description: 'Data-driven shipping cost trend analysis across major carriers.', url: '/insights/' },
};

export default function InsightsIndex() {
  const articles = getAllInsightArticles();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'ShipCalcWize Insights',
            url: `${SITE_URL}/insights/`,
            numberOfItems: articles.length,
            itemListElement: articles.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: a.title,
              url: `${SITE_URL}/insights/${a.slug}/`,
            })),
          }),
        }}
      />

      <TrustBlock
        sources={[
          { name: 'Freightos Baltic Index', url: 'https://fbx.freightos.com/' },
          { name: 'World Bank LPI', url: 'https://lpi.worldbank.org/' },
          { name: 'UNCTAD Maritime Transport', url: 'https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport' },
          { name: 'WCO HS Codes', url: 'https://www.wcoomd.org/en/topics/nomenclature/overview.aspx' },
          { name: 'US CBP', url: 'https://www.cbp.gov/trade' },
        ]}
        updated={DATA_LAST_UPDATED}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Shipping Cost Insights</h1>
        <p className="text-slate-600 max-w-3xl">
          Data-driven analysis of shipping rates, carrier pricing trends, and cost optimization strategies.
          Each article uses current rate data to help you make smarter shipping decisions.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/insights/${a.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 p-5 transition-colors"
          >
            <div className="text-xs text-slate-400 mb-1">
              <time dateTime={a.date}>{a.date}</time>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h2>
            <p className="text-sm text-slate-600">{a.summary}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Calculate your shipping costs</h2>
        <p className="text-sm text-slate-600 mb-4">
          Get exact rates for your specific package.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/calculator/" className="text-amber-700 hover:underline font-medium">Shipping calculator</Link>
            <span className="text-slate-500"> — compare rates by carrier, weight, and zone</span>
          </li>
          {/* HCU 2026-04-25 — /compare/ 410'd. */}
        </ul>
      </section>
    </div>
  );
}
