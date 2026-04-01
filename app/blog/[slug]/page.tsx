import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { AdSlot } from "@/components/AdSlot";
import { AuthorBox } from "@/components/AuthorBox";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}/`,
    },
    openGraph: {
      url: `/blog/${slug}/`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts().filter((p) => p.slug !== slug);
  const related = allPosts
    .filter((p) => p.category === post.category)
    .slice(0, 3);
  const others = allPosts.filter((p) => p.category !== post.category).slice(0, 3 - related.length);
  const suggestions = [...related, ...others];

  return (
    <>
      {/* Schema.org Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
            author: {
              "@type": "Person",
              name: "ShipCalcWize Logistics Team",
              description: "Freight and international shipping research",
              url: "https://shipcalcwize.com/about/",
              worksFor: {
                "@type": "Organization",
                name: "ShipCalcWize",
                url: "https://shipcalcwize.com",
              },
            },
            publisher: {
              "@type": "Organization",
              name: "ShipCalcWize",
              url: "https://shipcalcwize.com",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://shipcalcwize.com/blog/${slug}/`,
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6">
        <a href="/" className="hover:text-amber-600">Home</a>
        <span className="mx-1">›</span>
        <a href="/blog/" className="hover:text-amber-600">Guides</a>
        <span className="mx-1">›</span>
        <span className="text-slate-700">{post.category}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-slate-400">{post.readingTime} min read</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-4">
          {post.description}
        </p>
        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>Published {formatDate(post.publishedAt)}</span>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <span>· Updated {formatDate(post.updatedAt)}</span>
          )}
          <span>· ShipCalcWize Editorial Team</span>
        </div>
      </header>

      <AdSlot id="4567890123" />

      {/* Article body */}
      <article
        className="prose prose-slate max-w-none mt-8
          prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
          prose-p:leading-relaxed prose-p:text-slate-700
          prose-ul:my-3 prose-li:my-1
          prose-table:text-sm prose-th:bg-slate-50 prose-th:font-medium
          prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <AuthorBox />


      <AdSlot id="5678901234" />

      {/* CTA: Data tools */}
      <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Calculate Your Shipping Costs
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Use our free tools to estimate international shipping rates and compare carriers for your route.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/calculator/"
            className="text-sm px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
          >
            Shipping Calculator
          </a>
          <a
            href="/compare/"
            className="text-sm px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 font-medium"
          >
            Compare Carriers
          </a>
          <a
            href="/"
            className="text-sm px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            All Destinations
          </a>
        </div>
      </div>

      {/* Related guides */}
      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestions.map((p) => (
              <a
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="block border border-slate-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <span className="text-xs text-amber-600">{p.category}</span>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 mt-1 leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{p.readingTime} min read</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
