export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-slate-50 border-slate-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
        <span>📦</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">ShipCalcWize Logistics Team</span>
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium">Freight & International Shipping Experts</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Our logistics professionals and customs compliance specialists track carrier rates, dimensional weight rules, and customs requirements for domestic and international shipping. Rate data verified from carrier tariff schedules.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">✓ Carrier Verified</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">✓ 160+ Countries</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">✓ Customs Compliant</span>
        </div>
      </div>
    </div>
  );
}
