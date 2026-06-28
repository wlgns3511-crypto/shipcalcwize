/**
 * Network-wide publisher and per-site editorial team. Phase 6 v6.2 — honest
 * 4-layer vintage + DB-backed SOURCE_AUTHORITIES (FBX, WB LPI, UNCTAD, WCO,
 * US CBP). The previously proposed carrier rate sheets (USPS IMM, UPS, FedEx,
 * DHL, IATA Air Cargo Tariff) are NOT cited because shipping.db stores
 * carrier-aggregated baselines, not per-carrier rate ingest — methodology
 * page itself disclaims live carrier API.
 */

// ===== Vintage 4-layer separation =====
// ENTITY: per-country shipping baseline snapshot (177 countries × air/sea $/kg + transit days)
export const ENTITY_VINTAGE = '2026-04-29';
// STATE: 52 US-state ground shipping aggregates (USPS/UPS/FedEx zone presence)
export const STATE_VINTAGE = '2026-04-22';
// METHODOLOGY: how baselines are derived (FBX + WB LPI + UNCTAD + WCO + CBP +
// LandedCostTier / VatBurdenTier / TransitWindowTier / ShippingInterpretation)
export const METHODOLOGY_VINTAGE = '2026-05-12';
// ABOUT: editorial mission/scope
export const ABOUT_VINTAGE = '2026-05-12';
// SITE: schema.org WebSite root
export const SITE_VINTAGE = '2026-05-11';
// LEGAL: separate per page (honest review cycles, not bulk-touched)
// Privacy is reviewed more often than Terms because of AdSense disclosure
// requirements; Disclaimer changes least often. ingredipeek 교훈 — single
// shared timestamp reads as fabricated bulk-touch.
export const LEGAL_VINTAGES = {
  privacy: '2026-03-27',
  terms: '2026-02-18',
  disclaimer: '2026-05-09',
  editorialPolicy: '2026-04-17',
  correctionsPolicy: '2026-04-30',
};

// Back-compat: callers using DB_UPDATED keep working (alias to entity vintage).
export const DB_UPDATED = ENTITY_VINTAGE;

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description: 'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'ShipCalcWize Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

// ===== SOURCE AUTHORITIES (5, honest DB-backed only) =====
// Calibration vs original directive: the 5 carrier rate-sheet sources (USPS
// IMM, UPS Worldwide, FedEx International, DHL Express, IATA Air Cargo
// Tariff) were NOT ingested into shipping.db — methodology page explicitly
// frames country-level $/kg as "industry-typical baselines, not live rates
// pulled from a carrier API." Citing them as sourceOrganization would be a
// schema lie (HCU trap, propertytaxpeek 2026-05-06 lesson).
//
// These 5 are actually the data origins methodology + about already cite:
//   - FBX → sea freight per-kg baseline normalization
//   - WB LPI → 177-country transit-day adjustment
//   - UNCTAD → annual capacity/throughput baseline
//   - WCO → HS classification underpinning customs context (1,686-line JSON)
//   - US CBP → de-minimis.json Section 321 + 30-country customs notes
export const SOURCE_AUTHORITIES = [
  { '@type': 'Organization', name: 'Freightos Baltic Index (FBX)', url: 'https://fbx.freightos.com/' },
  { '@type': 'Organization', name: 'World Bank — Logistics Performance Index', url: 'https://lpi.worldbank.org/' },
  { '@type': 'Organization', name: 'UNCTAD — Review of Maritime Transport', url: 'https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport' },
  { '@type': 'Organization', name: 'World Customs Organization (WCO HS)', url: 'https://www.wcoomd.org/en/topics/nomenclature/overview.aspx' },
  { '@type': 'Organization', name: 'US Customs and Border Protection', url: 'https://www.cbp.gov/trade' },
];

// Per-source vintage strings shown in AuthorBox footer ("Source vintages: ...")
// These reflect the most recent edition we cross-reference, not site rebuild date.
export const SOURCE_VINTAGES: Record<string, string> = {
  'Freightos Baltic Index': '2026-04 (weekly index, last reviewed)',
  'World Bank LPI': '2023 (most recent edition)',
  'UNCTAD Maritime Review': '2024 (annual)',
  'WCO HS Nomenclature': '2022 Edition',
  'US CBP — Section 321': '2026-04',
};

// Disclaimer used on YMYL-MEDIUM pages (country detail + calculator) —
// shipping is a business decision, not financial/medical advice, so the
// language emphasizes verification at the carrier rather than professional
// licensing.
export const REVIEWER_DISCLAIMER = 'Shipping figures here are industry-typical baselines, not live carrier quotes. Live rates vary by chargeable weight, dimensional weight, fuel surcharge, peak-season indices, customs/duty fees, and contract discounts — confirm with the carrier or a licensed freight forwarder before booking.';
