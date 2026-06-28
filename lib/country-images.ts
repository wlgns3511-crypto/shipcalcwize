/**
 * Country-image lookup. Reads the manifest produced by
 * scripts/process-country-images.ts at module load (build time on Mac,
 * then baked into the SSG output — no runtime fs cost on the VPS).
 *
 * 177 entries cover all ISO 3166-1 countries in the shipping.db. Visapeek
 * consumes the same manifest as a 37-entry subset (its `/country/[slug]`
 * just hits its own 37 slugs; extra manifest entries are harmless).
 */
import manifest from '@/scripts/data/country-images-manifest.json';

export interface CountryImage {
  slug: string;
  name: string;
  code: string;
  avifPath: string;
  jpgPath: string;
  finalWidth: number;
  finalHeight: number;
  commonsFileUrl: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistText: string | null;
  artistHtml: string | null;
}

interface ManifestEntry {
  slug: string;
  name: string;
  code: string;
  avifPath?: string;
  jpgPath?: string;
  finalWidth?: number;
  finalHeight?: number;
  commonsFileUrl: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistText: string | null;
  artistHtml: string | null;
}

const BY_SLUG: ReadonlyMap<string, CountryImage> = (() => {
  const m = new Map<string, CountryImage>();
  for (const raw of (manifest as ManifestEntry[])) {
    if (!raw.avifPath || !raw.jpgPath || !raw.finalWidth || !raw.finalHeight) continue;
    m.set(raw.slug, {
      slug: raw.slug,
      name: raw.name,
      code: raw.code,
      avifPath: raw.avifPath,
      jpgPath: raw.jpgPath,
      finalWidth: raw.finalWidth,
      finalHeight: raw.finalHeight,
      commonsFileUrl: raw.commonsFileUrl,
      wikipediaUrl: raw.wikipediaUrl,
      wikipediaTitle: raw.wikipediaTitle,
      licenseShort: raw.licenseShort,
      licenseUrl: raw.licenseUrl,
      artistText: raw.artistText,
      artistHtml: raw.artistHtml,
    });
  }
  return m;
})();

export function getCountryImage(slug: string): CountryImage | undefined {
  return BY_SLUG.get(slug);
}

export function hasCountryImage(slug: string): boolean {
  return BY_SLUG.has(slug);
}
