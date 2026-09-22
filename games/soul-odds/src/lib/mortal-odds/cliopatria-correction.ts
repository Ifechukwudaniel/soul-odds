import type { CliopatriaPlaceRow } from "@/services/db/cliopatria";

export type WikidataDates = { inception: number | null; dissolved: number | null };

/**
 * A polity has one `cliopatria_place` row per date slice (its shape changed over time), all
 * sharing one Wikidata id. Only the slice with the earliest `fromYear` marks when the polity
 * actually started, and only the one with the latest `toYear` marks when it actually ended -
 * every other row's boundaries are just where Cliopatria drew the next shape change, not the
 * polity's lifespan, so they're never touched. Returns the rows that need fixing, keyed by id.
 */
export function correctedBoundaryYears(
  rows: CliopatriaPlaceRow[],
  dates: WikidataDates,
): Map<number, { fromYear: number; toYear: number }> {
  const result = new Map<number, { fromYear: number; toYear: number }>();
  if (rows.length === 0) return result;

  const sorted = [...rows].sort((a, b) => a.fromYear - b.fromYear);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  const correctedFromYear = dates.inception ?? first.fromYear;
  const correctedToYear = dates.dissolved ?? last.toYear;

  if (first.id === last.id) {
    if (
      (correctedFromYear !== first.fromYear || correctedToYear !== first.toYear) &&
      correctedFromYear <= correctedToYear
    ) {
      result.set(first.id, { fromYear: correctedFromYear, toYear: correctedToYear });
    }
    return result;
  }

  if (correctedFromYear !== first.fromYear && correctedFromYear <= first.toYear) {
    result.set(first.id, { fromYear: correctedFromYear, toYear: first.toYear });
  }

  if (correctedToYear !== last.toYear && last.fromYear <= correctedToYear) {
    result.set(last.id, { fromYear: last.fromYear, toYear: correctedToYear });
  }

  return result;
}
