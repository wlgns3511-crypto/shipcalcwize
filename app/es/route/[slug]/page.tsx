import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllRouteSlugs, getRouteBySlug } from "@/lib/db";
import { formatCost, formatDays, countryCodeToFlag } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdSlot } from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shipcalcwize.com";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllRouteSlugs(300).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) return {};
  return {
    title: `Envío de ${route.origin_name} a ${route.dest_name} - Costos y Tiempos de Tránsito`,
    description: `Envío de ${route.origin_name} a ${route.dest_name}: Flete aéreo ${formatCost(route.avg_cost_kg_air)}/kg (${formatDays(route.avg_days_air)}), flete marítimo ${formatCost(route.avg_cost_kg_sea)}/kg (${formatDays(route.avg_days_sea)}).`,
    alternates: {
      canonical: `${SITE_URL}/es/route/${slug}/`,
      languages: { en: `${SITE_URL}/route/${slug}/`, es: `${SITE_URL}/es/route/${slug}/` },
    },
  };
}

export default async function EsRoutePage({ params }: Props) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);
  if (!route) notFound();
  const t = await getDictionary("es");

  const expressCost = (route.avg_cost_kg_air ?? 12) * 1.6;
  const expressDays = Math.max(1, (route.avg_days_air ?? 5) - 2);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:underline">Inicio</a> / <span className="text-slate-800">{route.origin_name} a {route.dest_name}</span>
      </nav>

      <div className="mb-4">
        <a href={`/route/${slug}`} className="text-amber-600 hover:underline text-sm">{t.viewInEnglish}</a>
      </div>

      <h1 className="text-3xl font-bold mb-3 text-amber-900">
        {t.shipping} de {route.origin_name} {countryCodeToFlag(route.origin_code)} a {route.dest_name} {countryCodeToFlag(route.dest_code)}
      </h1>
      <p className="text-lg text-slate-600 mb-6">
        Compara costos de flete aéreo, marítimo y express para la ruta {route.origin_name} a {route.dest_name}.
      </p>

      {/* Cost comparison cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <h3 className="font-semibold text-amber-800 mb-2">{t.airFreight}</h3>
          <p className="text-3xl font-bold text-amber-700">{formatCost(route.avg_cost_kg_air)}<span className="text-sm font-normal text-slate-500">{t.perKg}</span></p>
          <p className="text-sm text-slate-600 mt-1">{formatDays(route.avg_days_air)} {t.transit}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-semibold text-blue-800 mb-2">{t.seaFreight}</h3>
          <p className="text-3xl font-bold text-blue-700">{formatCost(route.avg_cost_kg_sea)}<span className="text-sm font-normal text-slate-500">{t.perKg}</span></p>
          <p className="text-sm text-slate-600 mt-1">{formatDays(route.avg_days_sea)} {t.transit}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
          <h3 className="font-semibold text-orange-800 mb-2">{t.expressCourier}</h3>
          <p className="text-3xl font-bold text-orange-700">{formatCost(expressCost)}<span className="text-sm font-normal text-slate-500">{t.perKg}</span></p>
          <p className="text-sm text-slate-600 mt-1">{expressDays}-{route.avg_days_air} {t.transitDays.toLowerCase()}</p>
        </div>
      </div>

      <AdSlot id="3456789012" />

      {/* Required Documents */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">{t.requiredDocs}</h2>
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-amber-600 font-bold">1.</span> <strong>Factura Comercial</strong> - Detalles de mercancía, valor, comprador/vendedor</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">2.</span> <strong>Lista de Empaque</strong> - Lista detallada con pesos y dimensiones</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">3.</span> <strong>Conocimiento de Embarque / Guía Aérea</strong> - Documento de transporte</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">4.</span> <strong>Certificado de Origen</strong> - Para tasas preferenciales</li>
            <li className="flex gap-2"><span className="text-amber-600 font-bold">5.</span> <strong>Declaración Aduanera</strong> - Requerida para todos los envíos internacionales</li>
          </ul>
        </div>
      </section>

      {/* Customs notes */}
      {route.customs_notes && (
        <section className="mb-10 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Notas Aduaneras</h2>
          <p className="text-sm text-slate-700">{route.customs_notes}</p>
        </section>
      )}
    </div>
  );
}
