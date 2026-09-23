import type { SinNarratives } from "@/lib/mortal-odds/openrouter";

/** A sin narrative set plus the years it was written for, as the seed file stores it (the database keeps the period in columns). */
export type SinVariant = SinNarratives & { fromYear?: number; toYear?: number };

/**
 * How wide a variant's period is, by the year it falls in. Crime barely changes across millennia of
 * the deep past, so those windows are wide; from 1500 on witchcraft trials, piracy and the like
 * shift within a century, and from 1900 on (wars, Prohibition, cybercrime) within decades. Each size divides the year its tier starts at.
 */
const WINDOW_TIERS: { before: number; size: number }[] = [
  { before: 0, size: 500 },
  { before: 1500, size: 250 },
  { before: 1900, size: 100 },
  { before: 2000, size: 50 },
  { before: Infinity, size: 25 },
];

/** The fixed window of years that `year` belongs to, so seeded and on-demand variants for a period line up. */
export function periodOf(year: number): { fromYear: number; toYear: number } {
  const { size } = WINDOW_TIERS.find((tier) => year < tier.before)!;
  const fromYear = Math.floor(year / size) * size;
  return { fromYear, toYear: fromYear + size - 1 };
}

/** Tags narratives with the window `year` belongs to, as the seed file stores them. */
export function withPeriod(narratives: SinNarratives, year: number): SinVariant {
  return { ...narratives, ...periodOf(year) };
}
