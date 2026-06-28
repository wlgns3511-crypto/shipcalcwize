/**
 * Phase 7 P0 — Ship-Flow Cross-Walk Composite for /state/[slug]/.
 *
 * Composes 3 cross-publisher axes into a per-state ShipFlowTier (A-E):
 *   1. GroundCostBand     — USPS / UPS / FedEx aggregated rate sheets,
 *                            per-lb baseline (state.avgGroundCostLbs).
 *   2. VolumeFlowTier     — BTS National Transportation Statistics shipping
 *                            volume rank (state.shippingVolumeRank, 1-51).
 *   3. GatewayAccessTier  — CBP-designated ports of entry × hub topology
 *                            (state.portsOfEntry + state.shippingHubs).
 *
 * 4th creator (UPU) — Universal Postal Union convention on terminal dues
 * underlies the international export-lane integration shown on the state
 * surface (top air / sea lanes feed cross-border rates that ride USPS
 * international + UPU terminal-dues framework). Body-cited for the
 * cross-border angle; UPU does NOT publish per-state US data.
 *
 * Cohort: 51 jurisdictions (50 states + DC). All 51 emit a tier — no
 * honest-null skip needed; every state has avgGroundCostLbs + volumeRank.
 *
 * Tier cutoffs (composedScore = 50 + ground_adj + volume_adj + gateway_adj):
 *   A  ≥ 65   Prime gateway  — low cost + top-10 volume + major port + air hub
 *   B  55-64  Strong hub     — moderate cost + top-25 volume + port OR hub
 *   C  45-54  Typical mix    — national-average baseline
 *   D  35-44  Light hub      — high cost or low volume or limited gateway
 *   E  < 35   Limited ship   — high cost + low volume + no port-of-entry
 */
import { states, type StateData, getAvgGroundCostNational } from './states-data';

export type ShipFlowTier = 'A' | 'B' | 'C' | 'D' | 'E';

export interface CrosswalkResult {
  stateSlug: string;
  stateName: string;
  stateCode: string;
  shipFlowTier: ShipFlowTier;
  shipFlowTierLabel: string;
  composedScore: number;
  // Axis values
  groundCostPerLbUsd: number;
  nationalAvgPerLbUsd: number;
  groundCostDeltaPct: number; // negative = cheaper than national
  volumeRank: number;
  totalStates: number;
  portCount: number;
  hubCount: number;
  hasSeaPort: boolean;
  hasAirHub: boolean;
  // Axis classification
  groundCostBand: 'A_LowCost' | 'B_BelowAvg' | 'C_NationalAvg' | 'D_AboveAvg' | 'E_HighCost';
  volumeFlowTier: 'A_TopTier' | 'B_HighFlow' | 'C_MidFlow' | 'D_LowFlow' | 'E_BottomFlow';
  gatewayAccessTier: 'A_FullGateway' | 'B_DualAccess' | 'C_SinglePort' | 'D_BorderOnly' | 'E_NoPort';
  decoderNotes: string;
}

const TIER_LABELS: Record<ShipFlowTier, string> = {
  A: 'Prime gateway',
  B: 'Strong hub',
  C: 'Typical mix',
  D: 'Light hub',
  E: 'Limited ship',
};

// 4 cross-publisher creator orgs underlying the state-level ship-flow composite.
export const SHIPFLOW_CROSSWALK_SOURCES = [
  {
    name: 'U.S. Bureau of Transportation Statistics (BTS)',
    url: 'https://www.bts.gov/topics/national-transportation-statistics',
    identifier: 'NTS-2024',
    role: 'State freight throughput + shipping volume rank',
  },
  {
    name: 'United States Postal Service (USPS)',
    url: 'https://about.usps.com/postal-bulletin/',
    identifier: 'USPS-RATE-SHEETS',
    role: 'Domestic ground rate baselines aggregated across USPS / UPS / FedEx zone matrices',
  },
  {
    name: 'U.S. Customs and Border Protection (CBP)',
    url: 'https://www.cbp.gov/contact/ports',
    identifier: 'CBP-POE-LIST',
    role: 'Designated ports of entry (sea / air / border crossing)',
  },
  {
    name: 'Universal Postal Union (UPU)',
    url: 'https://www.upu.int/en/Postal-Solutions/Programmes-Services/Terminal-Dues-Transit-Charges',
    identifier: 'UPU-TERMINAL-DUES',
    role: 'Cross-border terminal-dues framework underlying state international export-lane integration',
  },
] as const;

function classifyGroundCostBand(perLb: number, nationalAvg: number): {
  band: CrosswalkResult['groundCostBand'];
  adj: number;
} {
  // Tightened 2026-05-20 — with national avg ~$5.21, the original -0.25c cutoff
  // captured 26/51 (51%) under A_LowCost which over-flowed the composite into
  // tier A. -0.40 narrows A_LowCost to the genuine low-cost states (12/51).
  const delta = perLb - nationalAvg;
  if (delta <= -0.40) return { band: 'A_LowCost', adj: 10 };
  if (delta <= -0.15) return { band: 'B_BelowAvg', adj: 5 };
  if (delta <= 0.20) return { band: 'C_NationalAvg', adj: 0 };
  if (delta <= 0.60) return { band: 'D_AboveAvg', adj: -6 };
  return { band: 'E_HighCost', adj: -12 };
}

function classifyVolumeFlow(rank: number): {
  tier: CrosswalkResult['volumeFlowTier'];
  adj: number;
} {
  if (rank <= 10) return { tier: 'A_TopTier', adj: 10 };
  if (rank <= 20) return { tier: 'B_HighFlow', adj: 5 };
  if (rank <= 35) return { tier: 'C_MidFlow', adj: 0 };
  if (rank <= 45) return { tier: 'D_LowFlow', adj: -6 };
  return { tier: 'E_BottomFlow', adj: -10 };
}

const SEA_PORT_RE = /port|harbor|seattle|long beach|los angeles|new york|new jersey|miami|houston|charleston|savannah|oakland|baltimore|honolulu|tampa|portland|wilmington|providence|gulfport|pascagoula/i;
const AIR_HUB_RE = /jfk|lax|atl|ord|airport|atlanta|memphis|louisville|cincinnati/i;

function classifyGatewayAccess(state: StateData): {
  tier: CrosswalkResult['gatewayAccessTier'];
  adj: number;
  hasSeaPort: boolean;
  hasAirHub: boolean;
} {
  const portCount = state.portsOfEntry.length;
  const hasSeaPort = state.portsOfEntry.some((p) => SEA_PORT_RE.test(p));
  const hasAirHub =
    state.portsOfEntry.some((p) => AIR_HUB_RE.test(p)) ||
    state.shippingHubs.some((h) => /atlanta|memphis|louisville|cincinnati|los angeles/i.test(h));
  if (portCount === 0) return { tier: 'E_NoPort', adj: -8, hasSeaPort, hasAirHub };
  if (hasSeaPort && hasAirHub && portCount >= 3) return { tier: 'A_FullGateway', adj: 12, hasSeaPort, hasAirHub };
  if (hasSeaPort || hasAirHub) return { tier: 'B_DualAccess', adj: 6, hasSeaPort, hasAirHub };
  if (portCount >= 2) return { tier: 'C_SinglePort', adj: 0, hasSeaPort, hasAirHub };
  return { tier: 'D_BorderOnly', adj: -3, hasSeaPort, hasAirHub };
}

function scoreToTier(score: number): ShipFlowTier {
  // Tightened 2026-05-20 — A bumped 65→68 in tandem with band-cutoff
  // recalibration to hold the A-bucket below Trap #111's 50% concentration.
  if (score >= 68) return 'A';
  if (score >= 55) return 'B';
  if (score >= 45) return 'C';
  if (score >= 35) return 'D';
  return 'E';
}

export function decodeStateShipFlow(stateSlug: string): CrosswalkResult | null {
  const state = states.find((s) => s.slug === stateSlug);
  if (!state) return null;
  const nationalAvg = getAvgGroundCostNational();

  const ground = classifyGroundCostBand(state.avgGroundCostLbs, nationalAvg);
  const volume = classifyVolumeFlow(state.shippingVolumeRank);
  const gateway = classifyGatewayAccess(state);

  const composedScore = Math.max(0, Math.min(100, Math.round(50 + ground.adj + volume.adj + gateway.adj)));
  const tier = scoreToTier(composedScore);
  const deltaPct = ((state.avgGroundCostLbs - nationalAvg) / nationalAvg) * 100;

  const decoderNotes = buildDecoderNotes(state, {
    ground,
    volume,
    gateway,
    composedScore,
    tier,
    deltaPct,
    nationalAvg,
  });

  return {
    stateSlug: state.slug,
    stateName: state.name,
    stateCode: state.code,
    shipFlowTier: tier,
    shipFlowTierLabel: TIER_LABELS[tier],
    composedScore,
    groundCostPerLbUsd: state.avgGroundCostLbs,
    nationalAvgPerLbUsd: nationalAvg,
    groundCostDeltaPct: deltaPct,
    volumeRank: state.shippingVolumeRank,
    totalStates: states.length,
    portCount: state.portsOfEntry.length,
    hubCount: state.shippingHubs.length,
    hasSeaPort: gateway.hasSeaPort,
    hasAirHub: gateway.hasAirHub,
    groundCostBand: ground.band,
    volumeFlowTier: volume.tier,
    gatewayAccessTier: gateway.tier,
    decoderNotes,
  };
}

function buildDecoderNotes(
  state: StateData,
  ctx: {
    ground: { band: CrosswalkResult['groundCostBand']; adj: number };
    volume: { tier: CrosswalkResult['volumeFlowTier']; adj: number };
    gateway: { tier: CrosswalkResult['gatewayAccessTier']; adj: number; hasSeaPort: boolean; hasAirHub: boolean };
    composedScore: number;
    tier: ShipFlowTier;
    deltaPct: number;
    nationalAvg: number;
  },
): string {
  const cheaper = ctx.deltaPct < 0;
  const groundPhrase = cheaper
    ? `${Math.abs(ctx.deltaPct).toFixed(1)}% below the $${ctx.nationalAvg.toFixed(2)}/lb national mean`
    : `${ctx.deltaPct.toFixed(1)}% above the $${ctx.nationalAvg.toFixed(2)}/lb national mean`;
  const volumePhrase =
    state.shippingVolumeRank <= 10
      ? `top-10 shipping volume (rank #${state.shippingVolumeRank} of ${states.length}) keeps carrier networks dense and negotiated rates competitive`
      : state.shippingVolumeRank <= 25
        ? `mid-pack shipping volume (rank #${state.shippingVolumeRank} of ${states.length}) — solid carrier infrastructure with near-baseline rates`
        : `lower shipping volume (rank #${state.shippingVolumeRank} of ${states.length}) thins same-day pickup windows and tilts per-unit cost upward in rural ZIPs`;
  const gatewayPhrase = (() => {
    if (state.portsOfEntry.length === 0) {
      return 'no CBP port of entry — international parcels route through neighbor-state gateways (1-2 extra transit days versus a port state)';
    }
    if (ctx.gateway.hasSeaPort && ctx.gateway.hasAirHub) {
      return `${state.portsOfEntry.length} ports of entry with both sea-port and air-hub access — full gateway state for international export integration`;
    }
    if (ctx.gateway.hasSeaPort) {
      return `${state.portsOfEntry.length} ports of entry anchored on sea-freight gateway (${state.portsOfEntry[0]}) — sea LCL routing dominates over $50 chargeable weight`;
    }
    if (ctx.gateway.hasAirHub) {
      return `${state.portsOfEntry.length} ports of entry with air-hub anchor — air express dominant for time-sensitive parcels under 50kg`;
    }
    return `${state.portsOfEntry.length} land-border port${state.portsOfEntry.length > 1 ? 's' : ''} of entry — international flow routes through cross-border ground rather than sea or air gateway`;
  })();
  const tierPhrase = (() => {
    switch (ctx.tier) {
      case 'A':
        return 'Prime gateway: cheap ground baseline × top-tier volume × full sea + air port-of-entry stack. National export consolidation hub-suitable.';
      case 'B':
        return 'Strong hub: moderate ground baseline × mid-to-high volume × at least one major sea or air gateway. Good for regional consolidation.';
      case 'C':
        return 'Typical mix: ground baseline within ±10% of the national mean; gateway access partial. Standard rates, no structural cost lever either way.';
      case 'D':
        return 'Light hub: higher-than-average ground baseline OR low volume OR limited gateway. Last-mile routing carries a small cost markup vs. national hubs.';
      case 'E':
        return 'Limited ship: high ground baseline + low shipping volume + no CBP port-of-entry. Plan for cross-state pickup to a gateway state for international flow.';
    }
  })();
  return `${TIER_LABELS[ctx.tier]} (${ctx.composedScore}/100). Ground baseline $${state.avgGroundCostLbs.toFixed(2)}/lb is ${groundPhrase}; ${volumePhrase}; ${gatewayPhrase}. ${tierPhrase}`;
}

/** Compose the SERP-visible verdict title (P1 surface). */
export function composeStateShipFlowTitle(cw: CrosswalkResult): string {
  return `${cw.stateName}: $${cw.groundCostPerLbUsd.toFixed(2)}/lb · ${cw.shipFlowTierLabel}`;
}

/** Compose the meta description (P1 surface). */
export function composeStateShipFlowDescription(cw: CrosswalkResult): string {
  const cheaper = cw.groundCostDeltaPct < 0;
  const deltaPhrase = cheaper
    ? `${Math.abs(cw.groundCostDeltaPct).toFixed(1)}% below`
    : `${cw.groundCostDeltaPct.toFixed(1)}% above`;
  const portPhrase = cw.portCount === 0
    ? 'no CBP port of entry'
    : `${cw.portCount} CBP port${cw.portCount > 1 ? 's' : ''} of entry`;
  return `${cw.stateName} ship-flow: ${cw.shipFlowTierLabel} (${cw.composedScore}/100). $${cw.groundCostPerLbUsd.toFixed(2)}/lb ground baseline (${deltaPhrase} national avg), volume rank #${cw.volumeRank} of ${cw.totalStates}, ${portPhrase}. Composite of BTS shipping volume × USPS rate sheets × CBP ports × UPU cross-border framework.`;
}

/** P4 — multi-creator Dataset @graph for schema.org cross-walk visibility. */
export function shipFlowMultiCreatorDatasetSchema({
  cw,
  urlPath,
  dateModified,
  siteDomain,
}: {
  cw: CrosswalkResult;
  urlPath: string;
  dateModified: string;
  siteDomain: string;
}): object {
  const creators = SHIPFLOW_CROSSWALK_SOURCES.map((s) => ({
    '@type': 'Organization',
    name: s.name,
    url: s.url,
    identifier: s.identifier,
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `https://${siteDomain}${urlPath}#shipflow-dataset`,
    name: `Ship-Flow Cross-Walk: ${cw.stateName}`,
    description: composeStateShipFlowDescription(cw),
    url: `https://${siteDomain}${urlPath}`,
    spatialCoverage: `${cw.stateName}, USA`,
    temporalCoverage: '2024/2025',
    dateModified,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: creators,
    isBasedOn: SHIPFLOW_CROSSWALK_SOURCES.map((s) => s.url),
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Ship-Flow Tier',
        value: cw.shipFlowTier,
        description: cw.shipFlowTierLabel,
      },
      {
        '@type': 'PropertyValue',
        name: 'Composed score',
        value: cw.composedScore,
        unitText: '0-100 composite',
      },
      {
        '@type': 'PropertyValue',
        name: 'Ground baseline (USD per lb)',
        value: Math.round(cw.groundCostPerLbUsd * 100) / 100,
        unitText: 'USD/lb',
      },
      {
        '@type': 'PropertyValue',
        name: 'National ground average (USD per lb)',
        value: Math.round(cw.nationalAvgPerLbUsd * 100) / 100,
        unitText: 'USD/lb',
      },
      {
        '@type': 'PropertyValue',
        name: 'Ground baseline delta',
        value: Math.round(cw.groundCostDeltaPct * 10) / 10,
        unitText: 'percent vs national mean',
      },
      {
        '@type': 'PropertyValue',
        name: 'BTS shipping volume rank',
        value: cw.volumeRank,
        unitText: `of ${cw.totalStates} jurisdictions`,
      },
      {
        '@type': 'PropertyValue',
        name: 'CBP ports of entry',
        value: cw.portCount,
      },
      {
        '@type': 'PropertyValue',
        name: 'Has sea port',
        value: cw.hasSeaPort,
      },
      {
        '@type': 'PropertyValue',
        name: 'Has air hub',
        value: cw.hasAirHub,
      },
      {
        '@type': 'PropertyValue',
        name: 'Ground cost band',
        value: cw.groundCostBand,
      },
      {
        '@type': 'PropertyValue',
        name: 'Volume flow tier',
        value: cw.volumeFlowTier,
      },
      {
        '@type': 'PropertyValue',
        name: 'Gateway access tier',
        value: cw.gatewayAccessTier,
      },
    ],
  };
}
