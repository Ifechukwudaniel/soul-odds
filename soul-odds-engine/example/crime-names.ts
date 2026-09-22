/**
 * Off-chain crime names for the "Ancient Souls" example title, keyed by bet configuration name
 * and crime id (title.json only stores the id — see `SoulCrimeDefinition`). A real title (e.g.
 * games/soul-odds) resolves names the same way, from its own API/config instead of the contract
 * (see `SIN_CATEGORIES` in that app's `lib/mortal-odds/config.ts`).
 */
export const CRIME_NAMES: Record<string, Record<number, string>> = {
  base: { 1: 'Murder', 2: 'Fraud', 3: 'Theft', 4: 'Heresy' },
  'plague-years': { 1: 'Murder', 2: 'Heresy', 3: 'Theft', 4: 'Witchcraft' },
};

/** Resolves a crime id to its name for `configurationName`, falling back to a generic label. */
export function crimeName(configurationName: string, id: number): string {
  return CRIME_NAMES[configurationName]?.[id] ?? `crime ${id}`;
}
