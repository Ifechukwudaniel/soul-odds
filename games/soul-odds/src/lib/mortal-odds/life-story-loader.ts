const CACHE_PREFIX = "mortal-odds-life-story:v2:";

export type LifeStoryPayload = { story: string; name: string | null };

export type LifeStoryCache = { read: (key: string) => LifeStoryPayload | null; write: (key: string, payload: LifeStoryPayload) => void };

function isLifeStoryPayload(value: unknown): value is LifeStoryPayload {
  if (typeof value !== "object" || value === null) return false;
  const { story, name } = value as Record<string, unknown>;
  return typeof story === "string" && (name === null || typeof name === "string");
}

/** Namespaced localStorage-backed cache for the AI-generated life story, keyed by round session key. */
export function createLocalStorageLifeStoryCache(): LifeStoryCache {
  return {
    read(key) {
      try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isLifeStoryPayload(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    write(key, payload) {
      try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
      } catch {
        /* storage unavailable: the AI story just won't survive a refresh */
      }
    },
  };
}

export type LifeStoryState = { ready: true; payload: LifeStoryPayload } | { ready: false };

/**
 * Fetches the AI-written life story for a round at most once, and makes sure a slow request for
 * an old round can never overwrite a newer one once the player has moved on (e.g. clicking
 * "Summon another soul" before the previous soul's narrative finished generating). `#latestKey`
 * is the single source of truth for which round is still "current" — a resolved fetch only calls
 * `onResolved` when its key still matches it.
 *
 * Deliberately never hands back the local `fallback` payload while a fetch is still in flight: a
 * story that shows up and then gets swapped out from under the player reads as a bug, not a
 * feature, so callers get "not ready yet" until there's a final answer — the real narrative on
 * success, or the fallback once the request has definitively failed.
 */
export class LifeStoryLoader {
  #cache: LifeStoryCache;
  #fetchStory: (key: string) => Promise<LifeStoryPayload>;
  #latestKey: string | null = null;
  #requested = new Set<string>();

  constructor(options: { cache: LifeStoryCache; fetchStory: (key: string) => Promise<LifeStoryPayload> }) {
    this.#cache = options.cache;
    this.#fetchStory = options.fetchStory;
  }

  /**
   * Returns the current state for `key`: ready with the cached payload if one exists, otherwise
   * not ready. The first time `key` is requested with nothing cached, starts a background fetch
   * that reports back through `onResolved` — with the fetched payload on success, or `fallback` on
   * failure — only if `key` is still the most recently requested one once it settles.
   */
  request(key: string, fallback: LifeStoryPayload, onResolved: (payload: LifeStoryPayload) => void): LifeStoryState {
    this.#latestKey = key;

    const cached = this.#cache.read(key);
    if (cached) {
      return { ready: true, payload: cached };
    }

    if (!this.#requested.has(key)) {
      this.#requested.add(key);
      this.#fetchStory(key)
        .then((payload) => {
          this.#cache.write(key, payload);
          if (this.#latestKey === key) {
            onResolved(payload);
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
