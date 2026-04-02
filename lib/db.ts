import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'shipping.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

// --- Types ---

export interface Country {
  code: string;
  name: string;
  slug: string;
  region: string;
  avg_shipping_cost_kg_air: number | null;
  avg_shipping_cost_kg_sea: number | null;
  avg_transit_days_air: number | null;
  avg_transit_days_sea: number | null;
}

export interface Carrier {
  id: number;
  name: string;
  slug: string;
  type: string;
  website: string;
  description: string;
}

export interface Route {
  id: number;
  origin_code: string;
  dest_code: string;
  slug: string;
  avg_cost_kg_air: number | null;
  avg_cost_kg_sea: number | null;
  avg_days_air: number | null;
  avg_days_sea: number | null;
  customs_notes: string | null;
}

export interface RouteWithNames extends Route {
  origin_name: string;
  dest_name: string;
  origin_slug: string;
  dest_slug: string;
}

export interface PortInfo {
  id: number;
  country_code: string;
  port_name: string;
  port_type: string;
  slug: string;
}

// --- Queries ---

export function getAllCountries(): Country[] {
  return getDb().prepare('SELECT * FROM countries ORDER BY name').all() as Country[];
}

export function getCountryBySlug(slug: string): Country | undefined {
  return getDb().prepare('SELECT * FROM countries WHERE slug = ?').get(slug) as Country | undefined;
}

export function getCountryByCode(code: string): Country | undefined {
  return getDb().prepare('SELECT * FROM countries WHERE code = ?').get(code) as Country | undefined;
}

export function getRouteBySlug(slug: string): RouteWithNames | undefined {
  return getDb().prepare(`
    SELECT r.*, o.name as origin_name, d.name as dest_name, o.slug as origin_slug, d.slug as dest_slug
    FROM routes r
    JOIN countries o ON r.origin_code = o.code
    JOIN countries d ON r.dest_code = d.code
    WHERE r.slug = ?
  `).get(slug) as RouteWithNames | undefined;
}

export function getAllRoutes(): RouteWithNames[] {
  return getDb().prepare(`
    SELECT r.*, o.name as origin_name, d.name as dest_name, o.slug as origin_slug, d.slug as dest_slug
    FROM routes r
    JOIN countries o ON r.origin_code = o.code
    JOIN countries d ON r.dest_code = d.code
    ORDER BY r.slug
  `).all() as RouteWithNames[];
}

export function getRoutesByOrigin(originCode: string): RouteWithNames[] {
  return getDb().prepare(`
    SELECT r.*, o.name as origin_name, d.name as dest_name, o.slug as origin_slug, d.slug as dest_slug
    FROM routes r
    JOIN countries o ON r.origin_code = o.code
    JOIN countries d ON r.dest_code = d.code
    WHERE r.origin_code = ?
    ORDER BY d.name
  `).all(originCode) as RouteWithNames[];
}

export function getRoutesByDest(destCode: string): RouteWithNames[] {
  return getDb().prepare(`
    SELECT r.*, o.name as origin_name, d.name as dest_name, o.slug as origin_slug, d.slug as dest_slug
    FROM routes r
    JOIN countries o ON r.origin_code = o.code
    JOIN countries d ON r.dest_code = d.code
    WHERE r.dest_code = ?
    ORDER BY o.name
  `).all(destCode) as RouteWithNames[];
}

export function getCarriers(): Carrier[] {
  return getDb().prepare('SELECT * FROM carriers ORDER BY name').all() as Carrier[];
}

export function getCarriersByType(type: string): Carrier[] {
  return getDb().prepare('SELECT * FROM carriers WHERE type = ? ORDER BY name').all(type) as Carrier[];
}

export function searchRoutes(query: string): RouteWithNames[] {
  const pattern = `%${query}%`;
  return getDb().prepare(`
    SELECT r.*, o.name as origin_name, d.name as dest_name, o.slug as origin_slug, d.slug as dest_slug
    FROM routes r
    JOIN countries o ON r.origin_code = o.code
    JOIN countries d ON r.dest_code = d.code
    WHERE o.name LIKE ? OR d.name LIKE ? OR r.slug LIKE ?
    ORDER BY r.slug
    LIMIT 50
  `).all(pattern, pattern, pattern) as RouteWithNames[];
}

export function getPopularRoutes(limit = 20): RouteWithNames[] {
  // Return routes with lowest air costs (most competitive/popular)
  return getDb().prepare(`
    SELECT r.*, o.name as origin_name, d.name as dest_name, o.slug as origin_slug, d.slug as dest_slug
    FROM routes r
    JOIN countries o ON r.origin_code = o.code
    JOIN countries d ON r.dest_code = d.code
    ORDER BY r.avg_cost_kg_air ASC
    LIMIT ?
  `).all(limit) as RouteWithNames[];
}

export function getPortsByCountry(countryCode: string): PortInfo[] {
  return getDb().prepare('SELECT * FROM port_info WHERE country_code = ? ORDER BY port_type, port_name').all(countryCode) as PortInfo[];
}

export function getAllPorts(): PortInfo[] {
  return getDb().prepare('SELECT * FROM port_info ORDER BY country_code, port_type, port_name').all() as PortInfo[];
}

export function getAllRouteSlugs(limit = 49000): { slug: string }[] {
  return getDb().prepare('SELECT slug FROM routes ORDER BY slug LIMIT ?').all(limit) as { slug: string }[];
}

// --- Ranking helpers ---

export function getAirCostRank(slug: string): { rank: number; total: number } {
  const total = (getDb().prepare("SELECT COUNT(*) as c FROM countries WHERE avg_shipping_cost_kg_air IS NOT NULL").get() as { c: number }).c;
  const country = getCountryBySlug(slug);
  if (!country || country.avg_shipping_cost_kg_air == null) return { rank: 0, total };
  const cheaper = (getDb().prepare(
    "SELECT COUNT(*) as c FROM countries WHERE avg_shipping_cost_kg_air IS NOT NULL AND avg_shipping_cost_kg_air < ?"
  ).get(country.avg_shipping_cost_kg_air) as { c: number }).c;
  return { rank: cheaper + 1, total };
}

export function getRegionAvgCost(region: string): { avgAir: number; avgSea: number; avgDaysAir: number; avgDaysSea: number } {
  const row = getDb().prepare(
    "SELECT AVG(avg_shipping_cost_kg_air) as avgAir, AVG(avg_shipping_cost_kg_sea) as avgSea, AVG(avg_transit_days_air) as avgDaysAir, AVG(avg_transit_days_sea) as avgDaysSea FROM countries WHERE region = ? AND avg_shipping_cost_kg_air IS NOT NULL"
  ).get(region) as { avgAir: number; avgSea: number; avgDaysAir: number; avgDaysSea: number };
  return {
    avgAir: Math.round(row.avgAir * 100) / 100,
    avgSea: Math.round(row.avgSea * 100) / 100,
    avgDaysAir: Math.round(row.avgDaysAir),
    avgDaysSea: Math.round(row.avgDaysSea),
  };
}

export function getDeliverySpeedRank(slug: string): { rank: number; total: number } {
  const total = (getDb().prepare("SELECT COUNT(*) as c FROM countries WHERE avg_transit_days_air IS NOT NULL").get() as { c: number }).c;
  const country = getCountryBySlug(slug);
  if (!country || country.avg_transit_days_air == null) return { rank: 0, total };
  const faster = (getDb().prepare(
    "SELECT COUNT(*) as c FROM countries WHERE avg_transit_days_air IS NOT NULL AND avg_transit_days_air < ?"
  ).get(country.avg_transit_days_air) as { c: number }).c;
  return { rank: faster + 1, total };
}

export function countRoutesByCountry(code: string): number {
  return (getDb().prepare("SELECT COUNT(*) as c FROM routes WHERE origin_code = ? OR dest_code = ?").get(code, code) as { c: number }).c;
}

export function getCountriesByRegion(): Record<string, Country[]> {
  const countries = getAllCountries();
  const grouped: Record<string, Country[]> = {};
  for (const c of countries) {
    if (!grouped[c.region]) grouped[c.region] = [];
    grouped[c.region].push(c);
  }
  return grouped;
}
