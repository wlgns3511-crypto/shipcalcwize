/**
 * Server-component flag renderer for ISO 3166-1 alpha-2 country codes.
 *
 * Renders `<img src="/flags/4x3/{code}.svg">` from the `flag-icons` SVG
 * library copied into `public/flags/4x3/` at deploy. Pure HTML, zero JS,
 * lazy-loaded by the browser, edge-cached by Cloudflare.
 *
 * Why replace the prior emoji-based countryCodeToFlag():
 *  - Windows browsers don't ship emoji flag glyphs → emoji shows as text
 *    ("US" instead of 🇺🇸). flag-icons SVGs render identically everywhere.
 *  - Predictable sizing (size prop), proper alt text, focusable for a11y.
 *  - All 271 ISO codes ship in the package — covers our 177-country dataset
 *    plus territories (TW, HK, XK kosovo, PS palestine, etc.).
 *
 * Falls back to a small monogram badge if `code` is empty or out of range.
 */

const SIZE_PX: Record<string, { w: number; h: number; cls: string }> = {
  // 4:3 aspect ratio
  xs: { w: 16, h: 12, cls: 'h-3 w-4' },
  sm: { w: 20, h: 15, cls: 'h-[15px] w-5' },
  md: { w: 28, h: 21, cls: 'h-[21px] w-7' },
  lg: { w: 40, h: 30, cls: 'h-[30px] w-10' },
  xl: { w: 56, h: 42, cls: 'h-[42px] w-14' },
};

interface Props {
  code: string;                                    // ISO 3166-1 alpha-2 (case-insensitive)
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;                                    // override alt text; defaults to "{CC} flag"
  className?: string;
  title?: string;                                  // browser tooltip on hover
}

export function CountryFlag({ code, size = 'sm', alt, className = '', title }: Props) {
  const lc = (code || '').trim().toLowerCase();
  const dim = SIZE_PX[size] ?? SIZE_PX.sm;

  // Fallback for empty / invalid code: ISO badge
  if (!lc || lc.length !== 2 || !/^[a-z]{2}$/.test(lc)) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] font-mono rounded-sm ${dim.cls} ${className}`}
        aria-label={alt ?? `Country flag (unknown: ${code})`}
        title={title ?? alt ?? ''}
      >
        {code?.slice(0, 2).toUpperCase() || '??'}
      </span>
    );
  }

  return (
    <img
      src={`/flags/4x3/${lc}.svg`}
      width={dim.w}
      height={dim.h}
      alt={alt ?? `${lc.toUpperCase()} flag`}
      title={title ?? ''}
      loading="lazy"
      decoding="async"
      className={`inline-block align-middle rounded-sm ring-1 ring-slate-200 object-cover ${dim.cls} ${className}`}
    />
  );
}
