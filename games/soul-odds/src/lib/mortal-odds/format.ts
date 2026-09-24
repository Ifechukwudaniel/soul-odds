/** Rounds to 2 decimals and adds thousands separators, e.g. 12345.678 -> "12,345.68". */
export function fmtNumber(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Formats a year as "X BCE" for non-positive years, "X CE" before 1500, or bare "XXXX" after. */
export function fmtYear(year: number): string {
  if (year <= 0) {
    const bce = 1 - year;
    return `${bce >= 10000 ? fmtNumber(bce) : bce} BCE`;
  }
  return year < 1500 ? `${year} CE` : `${year}`;
}

/** Splits a year into a number and its era suffix for the reel; joined, they read exactly like `fmtYear`. */
export function yearReelParts(year: number): { value: number; suffix: string } {
  if (year <= 0) {
    return { value: 1 - year, suffix: ' BCE' };
  }
  return { value: year, suffix: year < 1500 ? ' CE' : '' };
}

export function fmtPeople(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} billion`;
  if (n >= 1e6) return `${Math.round(n / 1e6)} million`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} thousand`;
  return `${Math.round(n)}`;
}

/**
 * Formats an estimated population as a round figure, since estimates are only good to about a
 * factor of two: the nearest half of its leading unit, e.g. 574,000 -> "550 thousand" and 1,430,000
 * -> "1.5 million".
 */
export function fmtPeopleRounded(n: number): string {
  if (n < 1000) return `${Math.round(n)}`;
  const step = 10 ** Math.floor(Math.log10(n)) / 2;
  const rounded = Math.round(n / step) * step;
  const [unit, label] =
    rounded >= 1e9 ? [1e9, 'billion'] : rounded >= 1e6 ? [1e6, 'million'] : [1e3, 'thousand'];
  return `${Number((rounded / unit).toFixed(1))} ${label}`;
}

/** Lowercases the first letter, for embedding a standalone sentence (e.g. an OpenRouter sin phrase) mid-clause. */
export function lowercaseFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function periodName(year: number): string {
  if (year < -10000) return 'Old Stone Age';
  if (year < -3300) return 'New Stone Age';
  if (year < -1200) return 'Bronze Age';
  if (year < -500) return 'Iron Age';
  if (year < 500) return 'Classical era';
  if (year < 1500) return 'Middle Ages';
  if (year < 1800) return 'Early modern era';
  if (year < 1950) return 'Industrial age';
  return 'Modern era';
}
