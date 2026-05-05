import {
  ENTITY_VINTAGE,
  EDITORIAL_TEAM,
  PUBLISHER,
  SOURCE_AUTHORITIES,
} from './authorship';

const SITE_NAME = 'ShipCalcWize';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shipcalcwize.com';

const PUBLISHER_NODE = {
  '@type': 'Organization',
  name: PUBLISHER.name,
  url: PUBLISHER.url,
};

const EDITORIAL_NODE = {
  '@type': 'Organization',
  name: EDITORIAL_TEAM.name,
  url: EDITORIAL_TEAM.url,
  parentOrganization: PUBLISHER_NODE,
};

type DatasetSchemaOpts = {
  spatialCoverage?: string;
  variableMeasured?: string[];
  vintage?: string;
};

export function datasetSchema(
  name: string,
  description: string,
  opts: DatasetSchemaOpts = {},
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    creator: PUBLISHER_NODE,
    publisher: PUBLISHER_NODE,
    sourceOrganization: SOURCE_AUTHORITIES.map((s) => ({
      '@type': 'Organization',
      name: s.name,
      url: s.url,
    })),
    isBasedOn: SOURCE_AUTHORITIES.map((s) => s.url),
    reviewedBy: EDITORIAL_NODE,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    dateModified: opts.vintage ?? ENTITY_VINTAGE,
    temporalCoverage: '2024/2025',
    ...(opts.spatialCoverage && { spatialCoverage: opts.spatialCoverage }),
    ...(opts.variableMeasured && { variableMeasured: opts.variableMeasured }),
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: SITE_URL },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function webPageSchema(title: string, description: string, url: string, reviewedAt?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${SITE_URL}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(reviewedAt && { dateModified: reviewedAt }),
  };
}

export function itemListSchema(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  // slug is treated as a full path fragment (e.g. "guide/my-guide")
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: PUBLISHER_NODE,
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}
