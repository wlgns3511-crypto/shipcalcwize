// HCU 2026-04-25 GSC rescue + reinforcement submit for shipcalcwize.
//
// Context: Phase C cleanup landed (sitemap 15,871→269, /route/ /compare/ /es/
// all middleware-410'd). 3-month GSC window had 2 clicks total on the killed
// /route/ subtree (germany-to-india, colombia-to-cuba via /es/route/) — those
// are written off as cardinality-bomb collateral.
//
// Real driver: /country/ pages. Top 30 GSC keywords are dominated by
// "shipping/postage to {country}" queries with hundreds of impressions
// (qatar 53, senegal 52+51+35+34+33+30, zimbabwe 58, israel 45+40+39,
// saudi-arabia 42+41+40+35, ghana 43, switzerland 43, taiwan 36, burundi 31,
// uruguay 24, zambia 55). IndexNow pings these as KEPT signal so Bing/Yandex
// recrawl them as alive while Google's organic recrawl handles the 410
// deindex of /route/ on its own.

const HOST = 'shipcalcwize.com';
const KEY = 'b8f4e2a1c3d5e6f7a9b0c1d2e3f4a5b6';

// Top GSC impression /country/ pages (3-month window).
const gscImpressedCountries = [
  'qatar', 'senegal', 'zimbabwe', 'israel', 'saudi-arabia',
  'ghana', 'switzerland', 'taiwan', 'burundi', 'uruguay',
  'zambia', 'iraq', 'mauritius', 'colombia', 'cuba',
  'germany', 'india', 'australia', 'canada', 'usa',
];

const evergreen = ['/', '/calculator/', '/blog/', '/guide/', '/insights/', '/state/'];

const urls: string[] = [];
for (const path of evergreen) urls.push(`https://${HOST}${path}`);
for (const slug of gscImpressedCountries) urls.push(`https://${HOST}/country/${slug}/`);

(async () => {
  console.log(`[GSC-RESCUE] submitting ${urls.length} URLs as KEPT...`);
  urls.forEach((u) => console.log(`  ${u}`));
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`status ${res.status} ${await res.text()}`);
})();
