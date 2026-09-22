import type { CliopatriaFeature } from "@/lib/mortal-odds/cliopatria";
import type { WikidataDates } from "@/lib/mortal-odds/cliopatria-correction";

/**
 * Same rule as the DB-row correction (see `cliopatria-correction.ts`), applied directly to raw
 * `cliopatria.geojson` features instead of `cliopatria_place` rows: a polity's many date-sliced
 * features share one Wikidata id, and only the earliest-starting and latest-ending feature mark
 * its real lifespan - every other feature's boundaries are just a shape-change date, left alone.
 * Returns corrections keyed by each feature's index in `features`.
 */
export function correctedFeatureBoundaries(
  features: readonly CliopatriaFeature[],
  dates: WikidataDates,
): Map<number, { fromYear: number; toYear: number }> {
  const result = new Map<number, { fromYear: number; toYear: number }>();
  if (features.length === 0) return result;

  const indices = features.map((_, index) => index).sort((a, b) => features[a]!.properties.FromYear - features[b]!.properties.FromYear);
  const firstIndex = indices[0]!;
  const lastIndex = indices[indices.length - 1]!;
  const first = features[firstIndex]!.properties;
  const last = features[lastIndex]!.properties;

  const correctedFromYear = dates.inception ?? first.FromYear;
  const correctedToYear = dates.dissolved ?? last.ToYear;

  if (firstIndex === lastIndex) {
    if (
      (correctedFromYear !== first.FromYear || correctedToYear !== first.ToYear) &&
      correctedFromYear <= correctedToYear
    ) {
      result.set(firstIndex, { fromYear: correctedFromYear, toYear: correctedToYear });
    }
    return result;
  }

  if (correctedFromYear !== first.FromYear && correctedFromYear <= first.ToYear) {
    result.set(firstIndex, { fromYear: correctedFromYear, toYear: first.ToYear });
  }

  if (correctedToYear !== last.ToYear && last.FromYear <= correctedToYear) {
    result.set(lastIndex, { fromYear: last.FromYear, toYear: correctedToYear });
  }

  return result;
}
