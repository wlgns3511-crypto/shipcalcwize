// HCU 2026-04-29 — Layer 0 Tier 1: per-country customs context.
// Reads routes.customs_notes, strips trailing "Shipping from {origin}." suffix,
// picks most-common stripped note per dest_code as the canonical country note.
// Falls back to first non-empty note if all stripped variants are unique.
//
// Output shape:
// { [destSlug: string]: {
//     code, name,
//     primaryNote: string,    // the canonical country-level customs context
//     fragmentCount: number,  // how many distinct variants were observed
//     altNotes: string[],     // up to 2 alt notes (e.g. FTA-specific)
//   }
// }
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DB = new Database(path.join(ROOT, "data", "shipping.db"), { readonly: true });

type Country = { code: string; name: string; slug: string };

const countries = DB.prepare(`SELECT code, name, slug FROM countries ORDER BY slug`).all() as Country[];
const countryNameByCode: Record<string, string> = Object.fromEntries(countries.map((c) => [c.code, c.name]));

const noteRows = DB.prepare(`
  SELECT origin_code, dest_code, customs_notes
  FROM routes
  WHERE customs_notes IS NOT NULL AND customs_notes != ''
`).all() as Array<{ origin_code: string; dest_code: string; customs_notes: string }>;

function stripOriginSuffix(note: string, originName: string): string {
  // Removes a trailing " Shipping from {originName}." (with or without leading space).
  const re = new RegExp(`\\s*Shipping from ${originName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.?\\s*$`);
  return note.replace(re, "").trim();
}

const groupedByDest: Record<string, Record<string, number>> = {};
for (const r of noteRows) {
  const originName = countryNameByCode[r.origin_code] ?? "";
  const stripped = originName ? stripOriginSuffix(r.customs_notes, originName) : r.customs_notes.trim();
  if (!stripped) continue;
  if (!groupedByDest[r.dest_code]) groupedByDest[r.dest_code] = {};
  groupedByDest[r.dest_code][stripped] = (groupedByDest[r.dest_code][stripped] ?? 0) + 1;
}

const out: Record<string, unknown> = {};
for (const c of countries) {
  const grouped = groupedByDest[c.code];
  if (!grouped) continue;
  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[0] ?? "";
  if (!primary) continue;

  const altNotes = sorted
    .slice(1, 3)
    .map(([note]) => note)
    .filter((n) => n && n !== primary);

  out[c.slug] = {
    code: c.code,
    name: c.name,
    primaryNote: primary,
    fragmentCount: sorted.length,
    altNotes,
  };
}

const outPath = path.join(ROOT, "lib", "generated", "country-customs.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${Object.keys(out).length} country customs blocks → ${outPath}`);

const dominant = Object.values(out).filter(
  (v): v is { fragmentCount: number } => typeof v === "object" && v !== null && "fragmentCount" in v && (v as any).fragmentCount === 1,
).length;
console.log(`Note: ${dominant} countries have a single canonical note; ${Object.keys(out).length - dominant} have variants.`);
