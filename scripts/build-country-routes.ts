// HCU 2026-04-29 — Layer 0 Tier 1: per-country top routes.
// Reads shipping.db, computes top routes per destination, writes to
// lib/generated/country-routes.json (consumed at build time).
//
// Output shape:
// { [destSlug: string]: {
//     code, name,
//     cheapestAir: Array<{originCode,originName,originSlug,costKg,days}>  (top 10)
//     cheapestSea: Array<{originCode,originName,originSlug,costKg,days}>  (top 10)
//     fastestAir:  Array<{originCode,originName,originSlug,costKg,days}>  (top 5)
//   }
// }
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DB = new Database(path.join(ROOT, "data", "shipping.db"), { readonly: true });

type CountryRow = { code: string; name: string; slug: string };
type RouteRow = {
  origin_code: string;
  origin_name: string;
  origin_slug: string;
  avg_cost_kg_air: number;
  avg_cost_kg_sea: number;
  avg_days_air: number;
  avg_days_sea: number;
};

const countries = DB.prepare(`SELECT code, name, slug FROM countries ORDER BY slug`).all() as CountryRow[];

const routesByDest = DB.prepare(`
  SELECT
    r.origin_code,
    o.name AS origin_name,
    o.slug AS origin_slug,
    r.avg_cost_kg_air,
    r.avg_cost_kg_sea,
    r.avg_days_air,
    r.avg_days_sea
  FROM routes r
  JOIN countries o ON o.code = r.origin_code
  WHERE r.dest_code = ?
`);

const out: Record<string, unknown> = {};

for (const c of countries) {
  const rows = routesByDest.all(c.code) as RouteRow[];
  if (rows.length === 0) continue;

  const cheapestAir = [...rows]
    .filter((r) => r.avg_cost_kg_air > 0)
    .sort((a, b) => a.avg_cost_kg_air - b.avg_cost_kg_air)
    .slice(0, 10)
    .map((r) => ({
      originCode: r.origin_code,
      originName: r.origin_name,
      originSlug: r.origin_slug,
      costKg: Math.round(r.avg_cost_kg_air * 100) / 100,
      days: r.avg_days_air,
    }));

  const cheapestSea = [...rows]
    .filter((r) => r.avg_cost_kg_sea > 0)
    .sort((a, b) => a.avg_cost_kg_sea - b.avg_cost_kg_sea)
    .slice(0, 10)
    .map((r) => ({
      originCode: r.origin_code,
      originName: r.origin_name,
      originSlug: r.origin_slug,
      costKg: Math.round(r.avg_cost_kg_sea * 100) / 100,
      days: r.avg_days_sea,
    }));

  const fastestAir = [...rows]
    .filter((r) => r.avg_days_air > 0)
    .sort((a, b) => a.avg_days_air - b.avg_days_air || a.avg_cost_kg_air - b.avg_cost_kg_air)
    .slice(0, 5)
    .map((r) => ({
      originCode: r.origin_code,
      originName: r.origin_name,
      originSlug: r.origin_slug,
      costKg: Math.round(r.avg_cost_kg_air * 100) / 100,
      days: r.avg_days_air,
    }));

  out[c.slug] = {
    code: c.code,
    name: c.name,
    cheapestAir,
    cheapestSea,
    fastestAir,
  };
}

const outPath = path.join(ROOT, "lib", "generated", "country-routes.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${Object.keys(out).length} country route blocks → ${outPath}`);
