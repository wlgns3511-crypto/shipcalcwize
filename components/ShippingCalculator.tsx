"use client";
import { useState, useMemo } from "react";

interface CountryOption {
  code: string;
  name: string;
}

interface Props {
  countries: CountryOption[];
  defaultOrigin?: string;
  defaultDest?: string;
  routeAirCost?: number | null;
  routeSeaCost?: number | null;
  routeAirDays?: number | null;
  routeSeaDays?: number | null;
}

type WeightUnit = "kg" | "lb";
type ShippingMethod = "air" | "sea" | "express";

export function ShippingCalculator({
  countries,
  defaultOrigin = "US",
  defaultDest = "",
  routeAirCost,
  routeSeaCost,
  routeAirDays,
  routeSeaDays,
}: Props) {
  const [origin, setOrigin] = useState(defaultOrigin);
  const [dest, setDest] = useState(defaultDest);
  const [weight, setWeight] = useState("5");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [method, setMethod] = useState<ShippingMethod>("air");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!w || w <= 0 || !origin || !dest) return null;

    const weightKg = unit === "lb" ? w * 0.453592 : w;

    // Volumetric weight calculation (industry standard: L*W*H / 5000 for air, /6000 for sea)
    let volumetricKg: number | null = null;
    const l = parseFloat(length);
    const wd = parseFloat(width);
    const h = parseFloat(height);
    if (l > 0 && wd > 0 && h > 0) {
      const divisor = method === "sea" ? 6000 : 5000;
      volumetricKg = (l * wd * h) / divisor;
    }

    const chargeableWeight = volumetricKg ? Math.max(weightKg, volumetricKg) : weightKg;

    // Base rates (use route-specific if available)
    let airRate = routeAirCost ?? 12.0;
    let seaRate = routeSeaCost ?? 3.0;
    const expressRate = airRate * 1.6;
    const airDays = routeAirDays ?? 5;
    const seaDays = routeSeaDays ?? 30;

    // Weight discount tiers
    let discount = 1.0;
    if (chargeableWeight > 100) discount = 0.65;
    else if (chargeableWeight > 50) discount = 0.75;
    else if (chargeableWeight > 20) discount = 0.85;
    else if (chargeableWeight > 10) discount = 0.92;

    airRate *= discount;
    seaRate *= discount;

    let rate: number;
    let transitDays: string;
    let methodLabel: string;

    switch (method) {
      case "air":
        rate = airRate;
        transitDays = `${airDays}-${airDays + 3} days`;
        methodLabel = "Air Freight";
        break;
      case "sea":
        rate = seaRate;
        transitDays = `${seaDays}-${seaDays + 7} days`;
        methodLabel = "Sea Freight";
        break;
      case "express":
        rate = expressRate * discount;
        transitDays = `${Math.max(1, airDays - 2)}-${airDays} days`;
        methodLabel = "Express (DHL/FedEx/UPS)";
        break;
    }

    const estimatedLow = chargeableWeight * rate * 0.85;
    const estimatedHigh = chargeableWeight * rate * 1.25;
    const costPerKg = rate;

    return {
      chargeableWeight,
      volumetricKg,
      estimatedLow,
      estimatedHigh,
      transitDays,
      methodLabel,
      costPerKg,
    };
  }, [origin, dest, weight, unit, length, width, height, method, routeAirCost, routeSeaCost, routeAirDays, routeSeaDays]);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-amber-900 mb-4">Shipping Cost Calculator</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Origin Country</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          >
            <option value="">Select origin</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Destination Country</label>
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          >
            <option value="">Select destination</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Package Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0.1"
              step="0.1"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              placeholder="Weight"
            />
            <div className="flex border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setUnit("kg")}
                className={`px-3 py-2 text-sm cursor-pointer ${unit === "kg" ? "bg-amber-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                kg
              </button>
              <button
                onClick={() => setUnit("lb")}
                className={`px-3 py-2 text-sm cursor-pointer ${unit === "lb" ? "bg-amber-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                lb
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Method */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ShippingMethod)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          >
            <option value="air">Air Freight</option>
            <option value="sea">Sea Freight (Ocean)</option>
            <option value="express">Express (DHL/FedEx/UPS)</option>
          </select>
        </div>
      </div>

      {/* Dimensions (optional) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Dimensions <span className="text-slate-400 font-normal">(optional, cm)</span></label>
        <div className="flex gap-2">
          <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="L" min="0" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
          <span className="self-center text-slate-400">x</span>
          <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="W" min="0" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
          <span className="self-center text-slate-400">x</span>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="H" min="0" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-white rounded-lg border border-amber-200 p-4">
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Estimated Cost</p>
              <p className="text-2xl font-bold text-amber-700">
                ${result.estimatedLow.toFixed(0)} - ${result.estimatedHigh.toFixed(0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Transit Time</p>
              <p className="text-2xl font-bold text-amber-700">{result.transitDays}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Cost per kg</p>
              <p className="text-2xl font-bold text-amber-700">${result.costPerKg.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 space-y-1">
            <p><span className="font-medium">Method:</span> {result.methodLabel}</p>
            <p><span className="font-medium">Chargeable Weight:</span> {result.chargeableWeight.toFixed(1)} kg</p>
            {result.volumetricKg && (
              <p><span className="font-medium">Volumetric Weight:</span> {result.volumetricKg.toFixed(1)} kg</p>
            )}
          </div>
        </div>
      )}

      {/* High-CPC keywords footer */}
      <div className="mt-6 pt-4 border-t border-amber-200 text-xs text-slate-400 space-y-1">
        <p>Looking for the best rates? Compare <span className="text-slate-500">freight forwarding quotes</span>, <span className="text-slate-500">cargo insurance rates</span>, <span className="text-slate-500">customs brokerage services</span>, <span className="text-slate-500">international shipping discounts</span>, and <span className="text-slate-500">logistics management software</span> for your shipment.</p>
      </div>
    </div>
  );
}
