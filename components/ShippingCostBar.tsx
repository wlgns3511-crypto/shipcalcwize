/** Pure CSS bar chart — shipping costs & transit times vs region average */
export function ShippingCostBar({
  countryName,
  airCost,
  seaCost,
  airDays,
  seaDays,
  regionName,
  regionAvg,
}: {
  countryName: string;
  airCost: number | null;
  seaCost: number | null;
  airDays: number | null;
  seaDays: number | null;
  regionName: string;
  regionAvg: { avgAir: number; avgSea: number; avgDaysAir: number; avgDaysSea: number };
}) {
  type Bar = { label: string; value: number; avg: number; unit: string };
  const bars: Bar[] = [];

  if (airCost != null) bars.push({ label: 'Air Freight Cost', value: airCost, avg: regionAvg.avgAir, unit: '$/kg' });
  if (seaCost != null) bars.push({ label: 'Sea Freight Cost', value: seaCost, avg: regionAvg.avgSea, unit: '$/kg' });
  if (airDays != null) bars.push({ label: 'Air Transit Time', value: airDays, avg: regionAvg.avgDaysAir, unit: 'days' });
  if (seaDays != null) bars.push({ label: 'Sea Transit Time', value: seaDays, avg: regionAvg.avgDaysSea, unit: 'days' });

  if (bars.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-1 text-amber-900">
        {countryName} vs {regionName} Average
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Compare shipping costs and transit times to the {regionName} regional average.
      </p>
      <div className="space-y-4">
        {bars.map((b) => {
          const maxVal = Math.max(b.value, b.avg) * 1.25 || 1;
          const valPct = Math.round((b.value / maxVal) * 100);
          const avgPct = Math.round((b.avg / maxVal) * 100);
          const above = b.value > b.avg;
          const diff = b.avg > 0 ? ((b.value - b.avg) / b.avg * 100).toFixed(0) : '0';

          return (
            <div key={b.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-700">{b.label}</span>
                <span className={above ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {b.value.toFixed(b.unit === '$/kg' ? 2 : 0)} {b.unit}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({above ? '+' : ''}{diff}%)
                  </span>
                </span>
              </div>
              {/* Country bar */}
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${above ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${valPct}%` }}
                />
              </div>
              {/* Region avg bar */}
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-amber-300"
                  style={{ width: `${avgPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>{countryName}</span>
                <span>{regionName} avg: {b.avg.toFixed(b.unit === '$/kg' ? 2 : 0)} {b.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-400" /> Below avg
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-400" /> Above avg
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-amber-300" /> Region avg
        </span>
      </div>
    </section>
  );
}
