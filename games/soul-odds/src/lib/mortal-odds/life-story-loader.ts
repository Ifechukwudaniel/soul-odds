const CACHE_PREFIX = "mortal-odds-life-story:v1:";

export type LifeStoryCache = { read: (key: string) => string | null; write: (key: string, story: string) => void };

/** Namespaced localStorage-backed cache for the AI-generated life story, keyed by round session key. */
export function createLocalStorageLifeStoryCache(): LifeStoryCache {
  return {
    read(key) {
      try {
        return localStorage.getItem(CACHE_PREFIX + key);
      } catch {
        return null;
      }
    },
    write(key, story) {
      try {
        localStorage.setItem(CACHE_PREFIX + key, story);
      } catch {
        /* storage unavailable: the AI story just won't survive a refresh */
      }
    },
  };
}

export type LifeStoryState = { ready: true; story: string } | { ready: false };

/**
 * Fetches the AI-written life story for a round at most once, and makes sure a slow request for
 * an old round can never overwrite a newer one once the player has moved on (e.g. clicking
 * "Summon another soul" before the previous soul's narrative finished generating). `#latestKey`
 * is the single source of truth for which round is still "current" — a resolved fetch only calls
 * `onResolved` when its key still matches it.
 *
 * Deliberately never hands back the local `fallback` story while a fetch is still in flight: a
 * story that shows up and then gets swapped out from under the player reads as a bug, not a
 * feature, so callers get "not ready yet" until there's a final answer — the real narrative on
 * success, or the fallback once the request has definitively failed.
 */
export class LifeStoryLoader {
  #cache: LifeStoryCache;
  #fetchStory: (key: string) => Promise<string>;
  #latestKey: string | null = null;
  #requested = new Set<string>();

  constructor(options: { cache: LifeStoryCache; fetchStory: (key: string) => Promise<string> }) {
    this.#cache = options.cache;
    this.#fetchStory = options.fetchStory;
  }

  /**
   * Returns the current state for `key`: ready with the cached story if one exists, otherwise
   * not ready. The first time `key` is requested with nothing cached, starts a background fetch
   * that reports back through `onResolved` — with the fetched story on success, or `fallback` on
   * failure — only if `key` is still the most recently requested one once it settles.
   */
  request(key: string, fallback: string, onResolved: (story: string) => void): LifeStoryState {
    this.#latestKey = key;

    const cached = this.#cache.read(key);
    if (cached) {
      return { ready: true, story: cached };
    }

    if (!this.#requested.has(key)) {
      this.#requested.add(key);
      this.#fetchStory(key)
        .then((story) => {
          this.#cache.write(key, story);
          if (this.#latestKey === key) {
            onResolved(story);
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
