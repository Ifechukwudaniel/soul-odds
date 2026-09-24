import type { SinNarratives } from '@/lib/mortal-odds/sin-variants';

export type SinNarrativesState = { ready: true; narratives: SinNarratives } | { ready: false };

/** Identifies a draw's sin narratives: they only depend on the birth year and the confirmed land. */
export function sinNarrativesKeyFor(year: number, placeName: string): string {
  return `${year}:${placeName}`;
}

/**
 * Fetches the four era-specific sin narratives for a draw's (year, place) at most once, and drops a
 * slow response for a draw the player has abandoned (retreated past "where" and redrew the land).
 * `#latestKey` decides which draw is current.
 *
 * On failure it resolves with `fallback`, since no local catalog remains and the round needs some
 * terminal answer to reveal with.
 */
export class SinNarrativesLoader {
  #fetchNarratives: (key: string) => Promise<SinNarratives>;
  #cache = new Map<string, SinNarratives>();
  #latestKey: string | null = null;
  #requested = new Set<string>();

  constructor(options: { fetchNarratives: (key: string) => Promise<SinNarratives> }) {
    this.#fetchNarratives = options.fetchNarratives;
  }

  request(
    key: string,
    fallback: SinNarratives,
    onResolved: (narratives: SinNarratives) => void,
  ): SinNarrativesState {
    this.#latestKey = key;

    const cached = this.#cache.get(key);
    if (cached) {
      return { ready: true, narratives: cached };
    }

    if (!this.#requested.has(key)) {
      this.#requested.add(key);
      this.#fetchNarratives(key)
        .then((narratives) => {
          this.#cache.set(key, narratives);
          if (this.#latestKey === key) {
            onResolved(narratives);
          }
        })
        .catch(() => {
          if (this.#latestKey === key) {
            onResolved(fallback);
          }
        });
    }

    return { ready: false };
  }
}
