import { SIN_CATEGORIES, SIN_ID_SEPARATOR } from '@/lib/mortal-odds/config';
import type { SinCategoryId } from '@/lib/mortal-odds/config';
import type { Life, Sin } from '@/types';

/** The contract predicts and settles at most this many crime categories per soul. */
export const MAX_SINS = 2;

const CATEGORY_IDS: string[] = SIN_CATEGORIES.map((category) => category.id);

function isCategory(id: string): id is SinCategoryId {
  return CATEGORY_IDS.includes(id);
}

/** The option id for a set of sin categories: "none" when empty, else the known ids in contract bit order. */
export function sinOptionId(categories: readonly string[]): string {
  const known = CATEGORY_IDS.filter((id) => categories.includes(id));
  return known.length === 0 ? 'none' : known.join(SIN_ID_SEPARATOR);
}

export function categoriesOfSinOption(optionId: string): SinCategoryId[] {
  return optionId.split(SIN_ID_SEPARATOR).filter(isCategory);
}

/** The contract's `crimeMask` for a sin option id: one bit per category, 0 for "none". */
export function crimeMaskOfSinOption(optionId: string): number {
  return categoriesOfSinOption(optionId).reduce(
    (mask, id) => mask | (1 << CATEGORY_IDS.indexOf(id)),
    0,
  );
}

export function categoriesOfCrimeMask(crimeMask: number): SinCategoryId[] {
  return SIN_CATEGORIES.filter((_category, bit) => (crimeMask & (1 << bit)) !== 0).map(
    (category) => category.id,
  );
}

/** Every sin recorded for a life, falling back to its one primary sin for lives that predate multi-sin. */
export function sinsOf(life: Life): Sin[] {
  return life.sins ?? (life.sin ? [life.sin] : []);
}
