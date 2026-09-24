/** Years from which pre-gunpowder weapons and raiding parties no longer fit a life story. */
export const MODERN_FROM = 1900;

const ARCHAIC =
  /\b(bows?|arrows?|archer\w*|swords?|spears?|lances?|catapults?|chariots?|encampments?|armou?r|shields?|crossbows?)\b/i;

/** The first archaic word a story uses despite being set in a modern year, or null when it reads true to the era. */
export function findAnachronism(options: {
  story: string;
  year: number;
  deathYear: number;
}): string | null {
  const { story, year, deathYear } = options;
  if (Math.min(year, deathYear) < MODERN_FROM) return null;
  return story.match(ARCHAIC)?.[0] ?? null;
}
