"use client";

import { useState } from "react";

interface ShippingEstimatorProps {
  countryName: string;
  avgCostKgAir: number | null;
  avgCostKgSea: number | null;
  avgDeliveryDaysAir: number | null;
  avgDeliveryDaysSea: number | null;
}

export function ShippingEstimator({
  countryName,
  avgCostKgAir,
  avgCostKgSea,
  avgDeliveryDaysAir,
  avgDeliveryDaysSea,
}: ShippingEstimatorProps) {
  const [weight, setWeight] = useState(5);
  const [speed, setSpeed] = useState<"air" | "sea">("air");

  const airRate = avgCostKgAir ?? 0;
  const seaRate = avgCostKgSea ?? 0;
  const airDays = avgDeliveryDaysAir ?? 0;
  const seaDays = avgDeliveryDaysSea ?? 0;

  const airCost = weight * airRate;
  const seaCost = weight * seaRate;
  const selectedCost = speed === "air" ? airCost : seaCost;
  const selectedDays = speed === "air" ? airDays : seaDays;
  const savings = Math.abs(airCost - seaCost);

  return (
    <section className="bg-white border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-1">
        Shipping Cost Estimator
      </h2>
      <p className="text-xs text-slate-500 mb-5">
        Estimate freight cost to {countryName} based on package weight and
        shipping speed. Uses country-level industry averages.
      </p>

      {/* Weight slider */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Package weight:{" "}
          <span className="text-amber-700 font-bold">{weight} kg</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={50}
          step={0.5}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full accent-amber-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>0.5 kg</span>
          <span>25 kg</span>
          <span>50 kg</span>
        </div>
      </div>

      {/* Speed toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setSpeed("air")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            speed === "air"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Air Freight
        </button>
        <button
          onClick={() => setSpeed("sea")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            speed === "sea"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Sea Freight
        </button>
      </div>

      {/* Result */}
      <div
        className={`rounded-lg p-5 mb-5 text-center ${
          speed === "air"
            ? "bg-amber-50 border border-amber-200"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Estimated cost
        </p>
        <p
          className={`text-3xl font-bold ${
            speed === "air" ? "text-amber-700" : "text-blue-700"
          }`}
        >
          ${selectedCost.toFixed(2)}
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Shipping {weight} kg to {countryName} by{" "}
          {speed === "air" ? "air" : "sea"} &mdash; ~{selectedDays} days
        </p>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-semibold text-slate-600">
                Method
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-600">
                Rate / kg
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-600">
                {weight} kg total
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-600">
                Transit
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              className={`border-b border-slate-100 ${
                speed === "air" ? "bg-amber-50" : ""
              }`}
            >
              <td className="px-3 py-2 font-medium text-amber-700">
                Air Freight
              </td>
              <td className="px-3 py-2 text-right">
                ${airRate.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                ${airCost.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right">{airDays} days</td>
            </tr>
            <tr
              className={`border-b border-slate-100 ${
                speed === "sea" ? "bg-blue-50" : ""
              }`}
            >
              <td className="px-3 py-2 font-medium text-blue-700">
                Sea Freight
              </td>
              <td className="px-3 py-2 text-right">
                ${seaRate.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                ${seaCost.toFixed(2)}
              </td>
              <td className="px-3 py-2 text-right">{seaDays} days</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Savings callout */}
      {savings > 0 && (
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-4">
          {airCost > seaCost ? (
            <p>
              Sea freight saves you{" "}
              <strong className="text-blue-700">${savings.toFixed(2)}</strong>{" "}
              compared to air, but takes {seaDays - airDays} more days.
            </p>
          ) : (
            <p>
              Air freight is{" "}
              <strong className="text-amber-700">${savings.toFixed(2)}</strong>{" "}
              cheaper for this weight, and arrives {airDays - seaDays} days
              sooner.
            </p>
          )}
        </div>
      )}

      {/* Customs tip */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
        <strong>Customs tip:</strong> These estimates cover freight only. Import
        duties, VAT, and customs fees for {countryName} can add 5&ndash;25% on
        top. Always check HS code classifications before shipping. Look up
        tariff rates at{" "}
        <a
          href="https://tariffpeek.com"
          className="underline font-medium hover:text-yellow-900"
        >
          TariffPeek.com
        </a>
        .
      </div>
    </section>
  );
}
