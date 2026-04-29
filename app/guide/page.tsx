import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Shipping Guides — Carrier Comparison, DIM Weight, DDP vs DDU, Insurance',
  description: 'In-depth shipping guides covering USPS vs UPS vs FedEx vs DHL costs, dimensional weight tricks, international DDP vs DDU, shipping insurance math, and free shipping threshold strategy.',
  alternates: { canonical: '/guide/' },
  openGraph: { title: 'Shipping Guides', description: 'Authoritative guides on US shipping, carriers, and international logistics.', url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'ShipCalcWize Guides',
            url: 'https://shipcalcwize.com/guide/',
            numberOfItems: guides.length,
            itemListElement: guides.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://shipcalcwize.com/guide/${g.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Shipping Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, evidence-based guides on US shipping and international logistics. Real
          carrier cost comparison, the dimensional weight billing trick that doubles shipping
          cost, DDP vs DDU for international ecommerce, when shipping insurance is worth it,
          and the right free shipping threshold for your products.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Run the calculator</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/calculator/" className="text-amber-700 hover:underline font-medium">Shipping calculator →</Link>
            <span className="text-slate-500"> estimate by carrier and route</span>
          </li>
          {/* HCU 2026-04-25 — /compare/ 410'd (hub-only, 0 clicks). */}
        </ul>
      </section>
    </div>
  );
}
