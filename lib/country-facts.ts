// HCU 2026-04-29 — Country-level fact loaders. Layer 0 inject path.
// Frozen JSON imports — no runtime mutation (tariffpeek 함정 13).

import countryRoutesRaw from "@/lib/generated/country-routes.json";
import countryCustomsRaw from "@/lib/generated/country-customs.json";
import deMinimisRaw from "@/data/de-minimis.json";

type RouteEntry = {
  originCode: string;
  originName: string;
  originSlug: string;
  costKg: number;
  days: number;
};

type CountryRoutesBlock = {
  code: string;
  name: string;
  cheapestAir: RouteEntry[];
  cheapestSea: RouteEntry[];
  fastestAir: RouteEntry[];
};

type CountryCustomsBlock = {
  code: string;
  name: string;
  primaryNote: string;
  fragmentCount: number;
  altNotes: string[];
};

type DeMinimisEntry = {
  code: string;
  currency: string;
  deMinimis: number | null;
  vatOrGstPct: number | null;
  vatLabel: string | null;
  generalDutyPctRange: string;
  notes: string;
  officialUrl: string;
};

const countryRoutes = countryRoutesRaw as Record<string, CountryRoutesBlock>;
const countryCustoms = countryCustomsRaw as Record<string, CountryCustomsBlock>;
const deMinimis = deMinimisRaw as Record<string, DeMinimisEntry | { _meta?: unknown }>;

export function getTopRoutesTo(slug: string): CountryRoutesBlock | null {
  return countryRoutes[slug] ?? null;
}

export type CustomsContext = {
  primaryNote: string;
  altNotes: string[];
  deMinimis: number | null;
  currency: string | null;
  vatPct: number | null;
  vatLabel: string | null;
  generalDutyPctRange: string | null;
  manualNotes: string | null;
  officialUrl: string | null;
};

export function getCustomsContext(slug: string): CustomsContext | null {
  const custBlock = countryCustoms[slug];
  const dm = deMinimis[slug];
  const isDeMinimisEntry = (v: unknown): v is DeMinimisEntry =>
    typeof v === "object" && v !== null && "code" in v && "currency" in v;

  if (!custBlock && !isDeMinimisEntry(dm)) return null;

  const dmEntry = isDeMinimisEntry(dm) ? dm : null;
  return {
    primaryNote: custBlock?.primaryNote ?? "",
    altNotes: custBlock?.altNotes ?? [],
    deMinimis: dmEntry?.deMinimis ?? null,
    currency: dmEntry?.currency ?? null,
    vatPct: dmEntry?.vatOrGstPct ?? null,
    vatLabel: dmEntry?.vatLabel ?? null,
    generalDutyPctRange: dmEntry?.generalDutyPctRange ?? null,
    manualNotes: dmEntry?.notes ?? null,
    officialUrl: dmEntry?.officialUrl ?? null,
  };
}

export type OriginContext = {
  routesAsOrigin: RouteEntry[];
  totalDestinations: number;
  cheapestKg: number | null;
};

export function getOriginContext(originSlug: string): OriginContext | null {
  // Walk all destinations, collect routes where this country is the origin.
  const collected: RouteEntry[] = [];
  for (const block of Object.values(countryRoutes)) {
    for (const r of block.cheapestAir) {
      if (r.originSlug === originSlug) {
        collected.push({ ...r, originName: block.name, originSlug: block.code.toLowerCase() });
        break;
      }
    }
  }
  if (collected.length === 0) return null;
  collected.sort((a, b) => a.costKg - b.costKg);
  return {
    routesAsOrigin: collected.slice(0, 10),
    totalDestinations: collected.length,
    cheapestKg: collected[0]?.costKg ?? null,
  };
}

export function getDeMinimisCoverage(): { covered: number; total: number } {
  const total = Object.keys(countryRoutes).length;
  const covered = Object.values(deMinimis).filter(
    (v) => typeof v === "object" && v !== null && "code" in v,
  ).length;
  return { covered, total };
}
