import { pickWeighted } from '@/lib/mortal-odds/rng';
import type { Rng } from '@/lib/mortal-odds/rng';
import type { Life } from '@/types';

type Cause = {
  /** Shameful causes name the soul's sin (lowercased) through this function form. */
  label: string | ((sin: string) => string);
  /** Inclusive age range the cause can strike. */
  ages: readonly [number, number];
  /** Years the cause exists in, when bounded (by birth year, so a life lived mostly before it doesn't get it). */
  from?: number;
  to?: number;
  sex?: Life['sex'];
  /** Only offered to a soul recorded as having committed a sin. */
  sinOnly?: boolean;
  weight: number;
};

const CAUSES: readonly Cause[] = [
  { label: 'Birth complications', ages: [0, 0], weight: 4 },
  { label: 'Fever', ages: [0, 60], weight: 4 },
  { label: 'Diarrhoeal disease', ages: [0, 4], weight: 3 },
  { label: 'Measles', ages: [0, 14], weight: 2 },
  { label: 'Smallpox', ages: [0, 60], to: 1970, weight: 3 },
  { label: 'Starvation', ages: [0, 80], to: 1950, weight: 3 },
  { label: 'Pneumonia', ages: [0, 90], weight: 4 },
  { label: 'Drowning', ages: [1, 40], weight: 2 },
  { label: 'Dysentery', ages: [5, 70], to: 1950, weight: 2 },
  { label: 'Cholera', ages: [5, 70], to: 1950, weight: 2 },
  { label: 'Typhoid', ages: [5, 60], to: 1950, weight: 2 },
  { label: 'Malaria', ages: [5, 70], weight: 2 },
  { label: 'Consumption', ages: [15, 60], to: 1960, weight: 3 },
  { label: 'Infection from a small wound', ages: [10, 60], to: 1940, weight: 3 },
  { label: 'Childbirth', ages: [15, 45], sex: 'girl', weight: 5 },
  { label: 'A fall from a horse', ages: [10, 70], to: 1920, weight: 2 },
  { label: 'A hunting accident', ages: [12, 60], to: 1850, weight: 2 },
  { label: 'A workplace accident', ages: [15, 65], from: 1750, weight: 2 },
  { label: 'A road accident', ages: [5, 90], from: 1900, weight: 4 },
  { label: 'A house fire', ages: [1, 90], weight: 1 },
  { label: 'A wasting illness', ages: [30, 90], to: 1800, weight: 3 },
  { label: 'Cancer', ages: [30, 95], from: 1800, weight: 5 },
  { label: 'Heart failure', ages: [40, 100], weight: 4 },
  { label: 'A stroke', ages: [50, 100], weight: 3 },
  { label: 'An overdose', ages: [15, 60], from: 1960, weight: 1 },
  { label: 'Dementia', ages: [70, 110], from: 1900, weight: 3 },
  { label: 'Old age', ages: [60, 110], weight: 5 },
  {
    label: (sin) => `Hanged before a jeering crowd for ${sin}`,
    ages: [14, 80],
    to: 1970,
    sinOnly: true,
    weight: 6,
  },
  {
    label: (sin) => `Beheaded in the public square for ${sin}`,
    ages: [14, 80],
    to: 1800,
    sinOnly: true,
    weight: 4,
  },
  {
    label: (sin) => `Flogged to death for ${sin}`,
    ages: [14, 80],
    to: 1850,
    sinOnly: true,
    weight: 3,
  },
  {
    label: (sin) => `Executed in prison for ${sin}`,
    ages: [18, 80],
    from: 1900,
    sinOnly: true,
    weight: 6,
  },
  {
    label: (sin) => `Beaten to death by an angry mob over ${sin}`,
    ages: [14, 80],
    sinOnly: true,
    weight: 4,
  },
  {
    label: () => 'Died in a foul cell, despised and forgotten',
    ages: [16, 90],
    sinOnly: true,
    weight: 5,
  },
  {
    label: () => 'Died in disgrace, shunned by kin and neighbours',
    ages: [16, 100],
    sinOnly: true,
    weight: 6,
  },
];

/**
 * Picks a random cause of death that fits the soul's age, sex and era, or null when there is no
 * death to explain: they are still living, or a historical catastrophe already killed them. A soul
 * recorded as having committed a sin may instead die a shameful death for it.
 */
export function pickCauseOfDeath(options: {
  life: Life;
  currentYear: number;
  rng: Rng;
}): string | null {
  const { life, currentYear, rng } = options;
  if (life.deathYear >= currentYear || life.shock) return null;

  const fits = CAUSES.filter(
    (cause) =>
      life.age >= cause.ages[0] &&
      life.age <= cause.ages[1] &&
      (cause.from === undefined || life.deathYear >= cause.from) &&
      (cause.to === undefined || life.deathYear <= cause.to) &&
      (cause.sex === undefined || cause.sex === life.sex) &&
      (!cause.sinOnly || life.sin !== null),
  );
  if (fits.length === 0) return null;

  const { label } = pickWeighted({ items: fits, weight: (cause) => cause.weight, rng });
  return typeof label === 'string' ? label : label(life.sin?.label.toLowerCase() ?? '');
}
