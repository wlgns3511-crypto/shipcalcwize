import type { Metadata } from "next";
import { getAllCountries } from "@/lib/db";
import { ShippingCalculator } from "@/components/ShippingCalculator";

export const metadata: Metadata = {
  title: "Shipping Calculator Embed",
  robots: { index: false, follow: false },
  openGraph: { url: "/embed/shipping-calc/" },
};

export default function EmbedShippingCalcPage() {
  const countries = getAllCountries();
  const countryOptions = countries.map((c) => ({ code: c.code, name: c.name }));

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <ShippingCalculator countries={countryOptions} />
      <p className="text-xs text-center text-slate-400 mt-3">
        Powered by <a href="https://shipcalcwize.com" target="_blank" rel="noopener" className="text-amber-600 hover:underline">ShipCalcWize.com</a>
      </p>
    </div>
  );
}
