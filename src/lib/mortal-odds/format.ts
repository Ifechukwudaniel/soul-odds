/** Rounds to 2 decimals and adds thousands separators, e.g. 12345.678 -> "12,345.68". */
export function fmtNumber(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Formats a year as "X BCE" for non-positive years, "X CE" before 1500, or bare "XXXX" after. */
export function fmtYear(year: number): string {
  if (year <= 0) {
    const bce = 1 - year;
    return `${bce >= 10000 ? fmtNumber(bce) : bce} BCE`;
  }
  return year < 1500 ? `${year} CE` : `${year}`;
}

/** Formats a population count in plain language: billion / million / thousand. */
export function fmtPeople(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} billion`;
  if (n >= 1e6) return `${Math.round(n / 1e6)} million`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} thousand`;
  return `${Math.round(n)}`;
}

/** Maps a year to its named historical period. */
export function periodName(year: number): string {
  if (year < -10000) return "Old Stone Age";
  if (year < -3300) return "New Stone Age";
  if (year < -1200) return "Bronze Age";
  if (year < -500) return "Iron Age";
  if (year < 500) return "Classical era";
  if (year < 1500) return "Middle Ages";
  if (year < 1800) return "Early modern era";
  if (year < 1950) return "Industrial age";
  return "Modern era";
}
