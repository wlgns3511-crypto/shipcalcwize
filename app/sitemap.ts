import type { MetadataRoute } from "next";
import { getAllCountries, getAllRouteSlugs } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shipcalcwize.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const countries = getAllCountries();
  const routes = getAllRouteSlugs(49000);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/calculator`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/compare`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${SITE_URL}/country/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const routePages: MetadataRoute.Sitemap = routes.map((r: { slug: string }) => ({
    url: `${SITE_URL}/route/${r.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...countryPages, ...routePages];
}
