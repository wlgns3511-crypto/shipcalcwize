import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shipcalcwize.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary("es");
  return {
    title: `${t.siteName} - ${t.title}`,
    description: t.description,
    alternates: {
      canonical: `${SITE_URL}/es/`,
      languages: { en: `${SITE_URL}/`, es: `${SITE_URL}/es/` },
    },
    openGraph: { url: `${SITE_URL}/es/` },
  };
}

export default async function EsHomePage() {
  const t = await getDictionary("es");
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl font-bold mb-3">{t.title}</h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">{t.description}</p>
      <a href="/" className="text-amber-600 hover:underline text-sm">{t.viewInEnglish}</a>
    </section>
  );
}
