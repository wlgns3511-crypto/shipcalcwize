export function formatCost(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return `$${value.toFixed(2)}`;
}

export function formatDays(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return `${value} days`;
}

export function countryCodeToFlag(code: string): string {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  );
}
