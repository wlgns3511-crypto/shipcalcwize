import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_NAME = "ShipCalcWize";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shipcalcwize.com";
const GA_ID = "G-WD86MC4KYY";
const ADSENSE_ID = "ca-pub-5724806562146685";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - International Shipping Cost Calculator & Comparison`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Compare international shipping costs, transit times, and carriers. Free calculator for air freight, ocean freight, and express shipping rates worldwide.",
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "ShipCalcWize",
              "url": "https://shipcalcwize.com",
              "description": "Compare international shipping costs, transit times, and carriers. Free calculator for air freight, ocean freight, and express shipping rates worldwide.",
              "inLanguage": "en-US"
            },
            {
              "@type": "Organization",
              "name": "ShipCalcWize",
              "url": "https://shipcalcwize.com",
              "description": "Compare international shipping costs, transit times, and carriers. Free calculator for air freight, ocean freight, and express shipping rates worldwide.",
              "sameAs": []
            }
          ]
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <header className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-amber-700">
              {SITE_NAME}
            </a>
            <nav className="flex gap-6 text-sm">
              <a href="/calculator" className="text-slate-600 hover:text-amber-600">Calculator</a>
              <a href="/compare" className="text-slate-600 hover:text-amber-600">Compare</a>
              <a href="/about" className="text-slate-600 hover:text-amber-600">About</a>
              <a href="/blog/" className="text-slate-600 hover:text-amber-600">Guides</a>
              <a href="/es/" className="text-slate-600 hover:text-amber-600 font-semibold">ES</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>
              Shipping cost estimates based on published carrier rates and industry averages.
              Actual rates may vary. Always confirm with carriers for exact quotes.
            </p>
            <p className="mt-2">
              <a href="/about" className="hover:text-amber-600">About</a>
              {" | "}
              <a href="/privacy" className="hover:text-amber-600">Privacy</a>
              {" | "}
              <a href="/terms" className="hover:text-amber-600">Terms</a>
              {" | "}
              <a href="/disclaimer" className="hover:text-amber-600">Disclaimer</a>
              {" | "}
              <a href="/contact" className="hover:text-amber-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Resources</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://tariffpeek.com" className="hover:text-amber-600">HS Codes &amp; Tariffs</a>
                <a href="https://calcpeek.com" className="hover:text-amber-600">Calculators</a>
                <a href="https://costbycity.com" className="hover:text-amber-600">Cost of Living</a>
              </div>
            </div>
            <p className="mt-1">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
