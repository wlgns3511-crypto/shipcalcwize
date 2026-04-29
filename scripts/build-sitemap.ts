#!/usr/bin/env tsx
/**
 * build-sitemap.ts — Static sitemap XML generator for shipcalcwize.
 *
 * PRUNING HISTORY (post-HCU):
 *   2026-04-22: /route/[slug]/by-weight/ × 235 dropped (derivative subpage).
 *   2026-04-25: /route/, /compare/, /es/ all 410'd via middleware.
 *               GSC 3-month evidence: /route/ 15,601 URLs / 2 clicks total.
 *               Real driver is /country/ (177 entities). /es/ rollout failed
 *               (9.5K 404, 1 click). /compare/ hub-only, 0 clicks.
 *               Route directories deleted; sitemap excludes all three.
 *
 * WHAT STAYS IN THE SITEMAP (~270):
 *   Static                                          5
 *   /country/ × 177      (real entities, real driver)
 *   /state/  × 52 + hub  (USA states)
 *   /guide/  × 6 + hub
 *   /blog/   × 24 + hub
 *   /insights/ × 4 + hub
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllCountries } from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllStates } from '../lib/states-data';
import { insightArticles } from '../lib/insight-articles';
import { getAllGuides } from '../lib/guides';

const SITE_URL = 'https://shipcalcwize.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }
function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}
function writeShard(id: number, entries: Entry[]) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Static pages — /compare/ removed (HCU 2026-04-25, route 410'd)
for (const [p, pr] of [
  ['/', '1.0'], ['/calculator/', '0.9'],
  ['/about/', '0.5'], ['/privacy/', '0.3'], ['/terms/', '0.3'], ['/contact/', '0.4'],
] as [string, string][]) {
  add({ url: `${SITE_URL}${p}`, priority: pr, changefreq: 'weekly' });
}

// Guide pages
const guides = getAllGuides();
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of guides) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt ? new Date(g.updatedAt).toISOString().split('T')[0] : NOW, priority: '0.7' });
}

// Blog pages
const posts = getAllPosts();
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of posts) {
  const lm = p.updatedAt ?? p.publishedAt;
  add({ url: `${SITE_URL}/blog/${p.slug}/`, lastmod: lm ? new Date(lm).toISOString().split('T')[0] : NOW, priority: '0.7' });
}

// Insight articles
add({ url: `${SITE_URL}/insights/`, priority: '0.8', changefreq: 'weekly' });
for (const a of insightArticles) {
  add({ url: `${SITE_URL}/insights/${a.slug}/`, lastmod: a.date, priority: '0.8' });
}

// Country pages
const countries = getAllCountries();
for (const c of countries) {
  add({ url: `${SITE_URL}/country/${c.slug}/`, priority: '0.8', changefreq: 'weekly' });
}

// State pages (USA)
const usStates = getAllStates();
add({ url: `${SITE_URL}/state/`, priority: '0.8', changefreq: 'weekly' });
for (const s of usStates) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.7', changefreq: 'weekly' });
}

// ─── /route/, /compare/, /es/ all REMOVED 2026-04-25 (HCU Phase C) ────────
// /route/  15,601 URLs, 2 GSC clicks in 3 months. App dir deleted; 410.
// /compare/  hub-only, 0 clicks. App dir deleted; 410.
// /es/     Spanish rollout failed — 9.5K GSC 404, 1 click. App dir deleted; 410.
// Real driver is /country/ (177 entities) above.

// ─── Cardinality guard ────────────────────────────────────────────────────
if (entries.length > 400 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `shipcalcwize sitemap has ${entries.length.toLocaleString()} URLs — Phase C budget is ~270.\n` +
      `Did /route/, /compare/, /es/, or /by-weight/ get re-added?\n` +
      `That's exactly the loop that caused the original cardinality collapse.\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// ─── Clean old sitemaps ────────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  const idx = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) => `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), idx);
}
console.log(`✓ ${entries.length} URLs, ${shardCount || 1} shard(s)`);
