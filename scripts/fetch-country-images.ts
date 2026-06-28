/**
 * Wikimedia Commons image fetcher for shipcalcwize (177 countries).
 *
 * Cloned from salarybycity/scripts/fetch-state-images.ts — same shape,
 * applied to ISO 3166-1 countries instead of US states. Strategy:
 *
 *   1. Try bare country article first ("France", "Japan", "Brazil"). The
 *      Wikipedia pageimage on most country articles is a montage or
 *      iconic landscape — passes PHOTO_MIME filter.
 *   2. If non-photo (e.g. lead pageimage is the country flag SVG or coat
 *      of arms), fall back to capital city article. Capital city pages
 *      universally use a landmark photo.
 *   3. MANUAL_TITLES for ambiguous country names (Georgia → state vs.
 *      country) and small territories.
 *
 * Skip rule: only permissively-licensed photos (CC-BY*, CC-BY-SA*, CC0,
 * PD/PDM, FAL, GFDL, GPL, no-restrictions).
 *
 * Resume-aware. Polite: 200ms gap, descriptive UA per Wikimedia policy.
 *
 * Output manifest is consumed by both shipcalcwize (177 entries) and
 * visapeek (37-entry subset; extra entries are harmless dead weight).
 */
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const UA = 'shipcalcwize/1.0 (https://shipcalcwize.com; wlgns3511@gmail.com) country image fetch';
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data/shipping.db');
const OUT_DIR = path.join(ROOT, 'scripts/data');
const OUT_JSON = path.join(OUT_DIR, 'country-images-manifest.json');

const PERMISSIVE_LICENSES = /^(cc[\s-]?by([\s-]?sa)?(-\d(\.\d)?)?(-[a-z]{2})?|cc0|public[\s-]?domain|pdm|pd|copyrighted[\s-]?free[\s-]?use|fal|free[\s-]?art[\s-]?license|gfdl(\s+\d(\.\d)?)?|gpl(\s*v?\d(\.\d)?)?(\+|-or-later)?|no[\s-]?restrictions|no[\s-]?known[\s-]?restrictions)$/i;
const PHOTO_MIME = /^image\/(jpeg|png|webp|tiff)$/i;

// Manual overrides for countries where bare-name article is ambiguous or
// the bare article has a non-photo lead pageimage. Each entry is an ordered
// list of WP titles to try.
const MANUAL_TITLES: Record<string, string[]> = {
  georgia: ['Georgia (country)', 'Tbilisi'],          // disambig: state vs country
  congo: ['Republic of the Congo', 'Brazzaville'],
  'congo-democratic-republic': ['Democratic Republic of the Congo', 'Kinshasa'],
  'ivory-coast': ['Ivory Coast', 'Yamoussoukro', 'Abidjan'],
  'east-timor': ['East Timor', 'Dili'],
  vatican: ['Vatican City', 'Vatican Hill', 'St. Peter\'s Basilica'],
  'sao-tome-and-principe': ['São Tomé and Príncipe', 'São Tomé'],
  // MISS recovery: country + capital both returned non-photo (flag SVG / coat of arms).
  // Use known landmark articles whose lead pageimage is a confirmed photo.
  'dr-congo': ['Boulevard du 30 Juin', 'Lubumbashi', 'Kinshasa'],
  'hong-kong': ['Central, Hong Kong', 'Tsim Sha Tsui', 'Victoria Peak'],
  kosovo: ['Prizren', 'Newborn monument', 'Pristina'],
  macau: ['Senado Square', 'Ruins of Saint Paul\'s', 'Macau Peninsula'],
  monaco: ['Port Hercules', 'Monaco-Ville', 'Casino de Monte-Carlo'],
  'puerto-rico': ['Old San Juan', 'San Juan, Puerto Rico', 'Castillo San Felipe del Morro'],
  'republic-of-congo': ['Pointe-Noire', 'Brazzaville'],
  singapore: ['Marina Bay, Singapore', 'Merlion', 'Marina Bay Sands'],
};

// Capital city fallbacks — primary photo source when the bare country
// article's pageimage is a flag SVG (rejected). Wikipedia capital articles
// universally use a landmark or skyline photo.
const CAPITALS: Record<string, string> = {
  afghanistan: 'Kabul',
  albania: 'Tirana',
  algeria: 'Algiers',
  andorra: 'Andorra la Vella',
  angola: 'Luanda',
  argentina: 'Buenos Aires',
  armenia: 'Yerevan',
  australia: 'Sydney',
  austria: 'Vienna',
  azerbaijan: 'Baku',
  bahamas: 'Nassau, Bahamas',
  bahrain: 'Manama',
  bangladesh: 'Dhaka',
  barbados: 'Bridgetown',
  belarus: 'Minsk',
  belgium: 'Brussels',
  belize: 'Belize City',
  benin: 'Porto-Novo',
  bhutan: 'Thimphu',
  bolivia: 'La Paz',
  'bosnia-and-herzegovina': 'Sarajevo',
  botswana: 'Gaborone',
  brazil: 'Rio de Janeiro',
  brunei: 'Bandar Seri Begawan',
  bulgaria: 'Sofia',
  'burkina-faso': 'Ouagadougou',
  burundi: 'Bujumbura',
  cambodia: 'Phnom Penh',
  cameroon: 'Yaoundé',
  canada: 'Toronto',
  'cape-verde': 'Praia',
  'central-african-republic': 'Bangui',
  chad: 'N\'Djamena',
  chile: 'Santiago, Chile',
  china: 'Beijing',
  colombia: 'Bogotá',
  comoros: 'Moroni, Comoros',
  'costa-rica': 'San José, Costa Rica',
  croatia: 'Zagreb',
  cuba: 'Havana',
  cyprus: 'Nicosia',
  'czech-republic': 'Prague',
  denmark: 'Copenhagen',
  djibouti: 'Djibouti (city)',
  dominica: 'Roseau',
  'dominican-republic': 'Santo Domingo',
  'dr-congo': 'Kinshasa',
  ecuador: 'Quito',
  egypt: 'Cairo',
  'el-salvador': 'San Salvador',
  'equatorial-guinea': 'Malabo',
  eritrea: 'Asmara',
  estonia: 'Tallinn',
  eswatini: 'Mbabane',
  ethiopia: 'Addis Ababa',
  fiji: 'Suva',
  finland: 'Helsinki',
  france: 'Paris',
  gabon: 'Libreville',
  gambia: 'Banjul',
  germany: 'Berlin',
  ghana: 'Accra',
  greece: 'Athens',
  grenada: 'St. George\'s, Grenada',
  guatemala: 'Guatemala City',
  guinea: 'Conakry',
  'guinea-bissau': 'Bissau',
  guyana: 'Georgetown, Guyana',
  haiti: 'Port-au-Prince',
  honduras: 'Tegucigalpa',
  'hong-kong': 'Victoria Harbour',
  hungary: 'Budapest',
  iceland: 'Reykjavík',
  india: 'New Delhi',
  indonesia: 'Jakarta',
  iran: 'Tehran',
  iraq: 'Baghdad',
  ireland: 'Dublin',
  israel: 'Jerusalem',
  italy: 'Rome',
  jamaica: 'Kingston, Jamaica',
  japan: 'Tokyo',
  jordan: 'Amman',
  kazakhstan: 'Astana',
  kenya: 'Nairobi',
  kiribati: 'Tarawa',
  kosovo: 'Pristina',
  kuwait: 'Kuwait City',
  kyrgyzstan: 'Bishkek',
  laos: 'Vientiane',
  latvia: 'Riga',
  lebanon: 'Beirut',
  lesotho: 'Maseru',
  liberia: 'Monrovia',
  libya: 'Tripoli, Libya',
  liechtenstein: 'Vaduz',
  lithuania: 'Vilnius',
  luxembourg: 'Luxembourg City',
  macau: 'Macau Peninsula',
  madagascar: 'Antananarivo',
  malawi: 'Lilongwe',
  malaysia: 'Kuala Lumpur',
  maldives: 'Malé',
  mali: 'Bamako',
  malta: 'Valletta',
  'marshall-islands': 'Majuro',
  mauritania: 'Nouakchott',
  mauritius: 'Port Louis',
  mexico: 'Mexico City',
  micronesia: 'Palikir',
  moldova: 'Chișinău',
  monaco: 'Monte Carlo',
  mongolia: 'Ulaanbaatar',
  montenegro: 'Podgorica',
  morocco: 'Marrakesh',
  mozambique: 'Maputo',
  myanmar: 'Naypyidaw',
  namibia: 'Windhoek',
  nauru: 'Yaren District',
  nepal: 'Kathmandu',
  netherlands: 'Amsterdam',
  'new-zealand': 'Wellington',
  nicaragua: 'Managua',
  niger: 'Niamey',
  nigeria: 'Lagos',
  'north-korea': 'Pyongyang',
  'north-macedonia': 'Skopje',
  norway: 'Oslo',
  oman: 'Muscat, Oman',
  pakistan: 'Islamabad',
  palau: 'Ngerulmud',
  palestine: 'Ramallah',
  panama: 'Panama City',
  'papua-new-guinea': 'Port Moresby',
  paraguay: 'Asunción',
  peru: 'Lima',
  philippines: 'Manila',
  poland: 'Warsaw',
  portugal: 'Lisbon',
  qatar: 'Doha',
  'republic-of-congo': 'Brazzaville',
  romania: 'Bucharest',
  russia: 'Moscow',
  rwanda: 'Kigali',
  'saint-kitts-and-nevis': 'Basseterre',
  'saint-lucia': 'Castries',
  'saint-vincent-and-the-grenadines': 'Kingstown',
  samoa: 'Apia',
  'san-marino': 'City of San Marino',
  'saudi-arabia': 'Riyadh',
  senegal: 'Dakar',
  serbia: 'Belgrade',
  seychelles: 'Victoria, Seychelles',
  'sierra-leone': 'Freetown',
  singapore: 'Singapore',
  slovakia: 'Bratislava',
  slovenia: 'Ljubljana',
  'solomon-islands': 'Honiara',
  somalia: 'Mogadishu',
  'south-africa': 'Cape Town',
  'south-korea': 'Seoul',
  'south-sudan': 'Juba',
  spain: 'Madrid',
  'sri-lanka': 'Colombo',
  sudan: 'Khartoum',
  suriname: 'Paramaribo',
  sweden: 'Stockholm',
  switzerland: 'Bern',
  syria: 'Damascus',
  taiwan: 'Taipei',
  tajikistan: 'Dushanbe',
  tanzania: 'Dar es Salaam',
  thailand: 'Bangkok',
  togo: 'Lomé',
  tonga: 'Nukuʻalofa',
  'trinidad-and-tobago': 'Port of Spain',
  tunisia: 'Tunis',
  turkey: 'Istanbul',
  turkmenistan: 'Ashgabat',
  tuvalu: 'Funafuti',
  uganda: 'Kampala',
  ukraine: 'Kyiv',
  'united-arab-emirates': 'Dubai',
  'united-kingdom': 'London',
  'united-states': 'Washington, D.C.',
  uruguay: 'Montevideo',
  uzbekistan: 'Tashkent',
  vanuatu: 'Port Vila',
  venezuela: 'Caracas',
  vietnam: 'Hanoi',
  yemen: 'Sanaa',
  zambia: 'Lusaka',
  zimbabwe: 'Harare',
};

interface Country { slug: string; name: string; code: string }
interface ManifestEntry {
  slug: string;
  name: string;
  code: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  mime: string;
  commonsFileTitle: string;
  commonsFileUrl: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistHtml: string | null;
  artistText: string | null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function api<T = unknown>(host: string, params: Record<string, string>): Promise<T> {
  const u = new URL(`https://${host}/w/api.php`);
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${u}`);
  return r.json() as Promise<T>;
}

function stripHtml(s: string | undefined | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null;
}

function titleCandidates(slug: string, name: string): string[] {
  if (MANUAL_TITLES[slug]) return MANUAL_TITLES[slug];
  const candidates: string[] = [name];
  const capital = CAPITALS[slug];
  if (capital) candidates.push(capital);
  return candidates;
}

async function lookupCountry(country: Country): Promise<ManifestEntry | null> {
  for (const title of titleCandidates(country.slug, country.name)) {
    type PageImagesResp = {
      query?: {
        pages?: Array<{
          pageid?: number;
          title: string;
          missing?: boolean;
          original?: { source: string; width: number; height: number };
          pageimage?: string;
        }>;
      };
    };
    const r1 = await api<PageImagesResp>('en.wikipedia.org', {
      action: 'query',
      prop: 'pageimages',
      piprop: 'original|name',
      titles: title,
      redirects: '1',
    });
    const page = r1.query?.pages?.[0];
    if (!page || page.missing || !page.original || !page.pageimage) continue;

    const mimeOk = page.original.source.match(/\.(jpe?g|png|webp|tiff?)(?:$|\?)/i);
    if (!mimeOk) continue;

    type ImageInfoResp = {
      query?: {
        pages?: Array<{
          title: string;
          imagerepository?: string;
          imageinfo?: Array<{
            url?: string;
            descriptionurl?: string;
            mime?: string;
            extmetadata?: Record<string, { value?: string } | undefined>;
          }>;
        }>;
      };
    };
    await sleep(200);
    const r2 = await api<ImageInfoResp>('en.wikipedia.org', {
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|mime|extmetadata',
      titles: `File:${page.pageimage}`,
    });
    const fpage = r2.query?.pages?.[0];
    const info = fpage?.imageinfo?.[0];
    if (!info || !info.mime || !PHOTO_MIME.test(info.mime)) {
      console.error(`  skip ${country.slug} via "${title}": non-photo mime ${info?.mime}`);
      continue;
    }
    const meta = info.extmetadata ?? {};
    const licenseShort = stripHtml(meta.LicenseShortName?.value) ?? '';
    const licenseKey = stripHtml(meta.License?.value) ?? licenseShort;
    if (!PERMISSIVE_LICENSES.test(licenseKey)) {
      console.error(`  skip ${country.slug} via "${title}": non-permissive "${licenseKey}"`);
      continue;
    }
    const artistHtml = meta.Artist?.value ?? null;
    return {
      slug: country.slug,
      name: country.name,
      code: country.code,
      wikipediaTitle: page.title,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      imageUrl: page.original.source,
      imageWidth: page.original.width,
      imageHeight: page.original.height,
      mime: info.mime,
      commonsFileTitle: fpage!.title,
      commonsFileUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(fpage!.title.replace(/ /g, '_'))}`,
      licenseShort,
      licenseUrl: stripHtml(meta.LicenseUrl?.value),
      artistHtml,
      artistText: stripHtml(artistHtml),
    };
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const db = new Database(DB_PATH, { readonly: true });
  const countries = db.prepare('SELECT slug, name, code FROM countries ORDER BY slug').all() as Country[];
  db.close();

  let existing: ManifestEntry[] = [];
  try { existing = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')); } catch { /* first run */ }
  const haveSlugs = new Set(existing.filter(e => e.imageUrl).map(e => e.slug));
  const todo = countries.filter(s => !haveSlugs.has(s.slug));
  console.log(`Resolving images: ${todo.length} new of ${countries.length} total (${haveSlugs.size} already present)…`);

  const out: ManifestEntry[] = existing.filter(e => e.imageUrl);
  const missing: string[] = [];
  for (const c of todo) {
    process.stdout.write(`  ${c.slug.padEnd(34)} `);
    try {
      const e = await lookupCountry(c);
      if (e) {
        out.push(e);
        process.stdout.write(`OK  ${e.imageWidth}x${e.imageHeight}  ${e.licenseShort}  via "${e.wikipediaTitle}"\n`);
      } else {
        missing.push(c.slug);
        process.stdout.write('MISS\n');
      }
    } catch (err) {
      missing.push(c.slug);
      process.stdout.write(`ERR ${(err as Error).message}\n`);
    }
    await sleep(200);
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${out.length}/${countries.length} entries to ${path.relative(ROOT, OUT_JSON)}`);
  if (missing.length) console.log(`Missing (${missing.length}): ${missing.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
