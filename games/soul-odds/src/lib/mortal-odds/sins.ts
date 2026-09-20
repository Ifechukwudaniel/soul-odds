import { SIN_CATEGORIES } from "@/lib/mortal-odds/config";
import type { SinCategoryId, SinConfig } from "@/lib/mortal-odds/config";
import { pickWeighted } from "@/lib/mortal-odds/rng";
import type { Rng } from "@/lib/mortal-odds/rng";
import type { RegionId, Sin } from "@/types";

/**
 * The first sin in the catalog whose era overlaps this life's years is the one recorded,
 * mirroring how applyShocks resolves catastrophes. `region` is null for the bookie's
 * year-only model, which falls back to each sin's flat "all" rate.
 */
export function pickSin(options: { year: number; deathYear: number; region: RegionId | null; rng: Rng; sins: SinConfig[] }): SinConfig | null {
  const { year, deathYear, region, rng, sins } = options;

  for (const sin of sins) {
    const base = (region ? sin.rate[region] : undefined) ?? sin.rate.all;
    if (!base) continue;

    const to = sin.to ?? Infinity;
    if (deathYear < sin.from || year > to) continue;

    if (rng() < base) return sin;
  }

  return null;
}

/**
 * The flavor sin shown for a soul whose on-chain crime category matched: a weighted pick among
 * the catalog's entries in that category whose era window covers this life, so the player
 * predicts a category but still reads a specific, era-appropriate sin at reveal. Falls back to
 * `null` when the category has no eligible entry for this era (e.g. an outdated single-sin
 * category); the caller substitutes a generic phrase for the category itself in that case.
 */
export function pickCategoryFlavorSin(options: {
  category: SinCategoryId;
  year: number;
  deathYear: number;
  rng: Rng;
  sins: SinConfig[];
}): SinConfig | null {
  const { category, year, deathYear, rng, sins } = options;
  const candidates = sins.filter(
    (sin) => sin.category === category && deathYear >= sin.from && year <= (sin.to ?? Infinity),
  );
  if (candidates.length === 0) return null;
  return pickWeighted({ items: candidates, weight: (sin) => sin.rate.all ?? 0.01, rng });
}

/**
 * The reveal-ready `Sin` for a soul whose on-chain crimeMask matched `category`: `id` stays the
 * category (so `LIFE_RESOLVERS.sins`/the "sins" bet still resolve against it), while `label`
 * and `phrase` carry a specific, era-appropriate flavor sin when one exists — falling back to a
 * generic phrase for the category itself when the catalog has nothing eligible for this era.
 */
export function buildFlavorSin(options: { category: SinCategoryId; year: number; deathYear: number; rng: Rng; sins: SinConfig[] }): Sin {
  const { category, year, deathYear, rng, sins } = options;
  const flavor = pickCategoryFlavorSin({ category, year, deathYear, rng, sins });
  const categoryLabel = SIN_CATEGORIES.find((entry) => entry.id === category)?.label ?? category;
  return flavor
    ? { id: category, label: flavor.label, phrase: flavor.phrase, from: flavor.from, to: flavor.to }
    : { id: category, label: categoryLabel, phrase: `committed a nameless act of ${categoryLabel.toLowerCase()}`, from: year, to: null };
}
