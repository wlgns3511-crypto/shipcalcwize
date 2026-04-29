// HCU 2026-04-29 — Layer 1 country/state/hub refresh push.
// Submits the page types touched by the depth inject:
// 177 country pages + 51 state pages + 5 hub pages (home, guide, blog, insights, about).
import Database from "better-sqlite3";
import path from "node:path";

const ROOT = process.cwd();
const DB = new Database(path.join(ROOT, "data", "shipping.db"), { readonly: true });
const HOST = "shipcalcwize.com";
const KEY = "b8f4e2a1c3d5e6f7a9b0c1d2e3f4a5b6";

const countries = DB.prepare(`SELECT slug FROM countries ORDER BY slug`).all() as { slug: string }[];
const stateSlugs = [
  "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia",
  "hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland",
  "massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new-hampshire","new-jersey",
  "new-mexico","new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania","rhode-island","south-carolina",
  "south-dakota","tennessee","texas","utah","vermont","virginia","washington","west-virginia","wisconsin","wyoming","district-of-columbia",
];

const urls: string[] = [
  `https://${HOST}/`,
  `https://${HOST}/guide/`,
  `https://${HOST}/blog/`,
  `https://${HOST}/insights/`,
  `https://${HOST}/about/`,
  ...countries.map((c) => `https://${HOST}/country/${c.slug}/`),
  ...stateSlugs.map((s) => `https://${HOST}/state/${s}/`),
];

async function submit(label: string, batch: string[]) {
  console.log(`[${label}] submitting ${batch.length} URLs...`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: batch,
    }),
  });
  const body = await res.text();
  console.log(`[${label}] status ${res.status} ${body ? `body="${body.slice(0, 200)}"` : ""}`);
}

(async () => {
  await submit("LAYER1", urls);
  console.log(`\nTotal: ${urls.length} URLs (countries=${countries.length} states=${stateSlugs.length} hubs=5)`);
})();
