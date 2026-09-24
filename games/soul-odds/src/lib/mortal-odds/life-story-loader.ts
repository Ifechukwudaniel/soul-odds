import { LIFE_STORY_CACHE_PREFIX } from '@/constants/storage';

export type LifeStoryPayload = { story: string; name: string | null };

export type LifeStoryCache = {
  read: (key: string) => LifeStoryPayload | null;
  write: (key: string, payload: LifeStoryPayload) => void;
};

function isLifeStoryPayload(value: unknown): value is LifeStoryPayload {
  if (typeof value !== 'object' || value === null) return false;
  const { story, name } = value as Record<string, unknown>;
  return typeof story === 'string' && (name === null || typeof name === 'string');
}

/** Namespaced localStorage-backed cache for the AI-generated life story, keyed by round session key. */
export function createLocalStorageLifeStoryCache(): LifeStoryCache {
  return {
    read(key) {
      try {
        const raw = localStorage.getItem(LIFE_STORY_CACHE_PREFIX + key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isLifeStoryPayload(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    write(key, payload) {
      try {
        localStorage.setItem(LIFE_STORY_CACHE_PREFIX + key, JSON.stringify(payload));
      } catch {
        /* ✦ storage unavailable: the AI story just won't survive a refresh */
      }
    },
  };
}

export type LifeStoryState = { ready: true; payload: LifeStoryPayload } | { ready: false };

/**
 * Fetches the AI-written life story for a round at most once, and drops a slow response for an old
 * round once the player has moved on (e.g. "Summon another soul" mid-request). `#latestKey` decides
 * which round is current.
 *
 * Never hands back the local `fallback` while a fetch is in flight, since a story that gets swapped
 * out reads as a bug: callers get "not ready" until there's a final answer.
 */
export class LifeStoryLoader {
  #cache: LifeStoryCache;
  #fetchStory: (key: string) => Promise<LifeStoryPayload>;
  #latestKey: string | null = null;
  #requested = new Set<string>();

  constructor(options: {
    cache: LifeStoryCache;
    fetchStory: (key: string) => Promise<LifeStoryPayload>;
  }) {
    this.#cache = options.cache;
    this.#fetchStory = options.fetchStory;
  }

  /**
   * Returns the state for `key`: ready with the cached payload if one exists, otherwise not ready.
   * The first request with nothing cached starts a background fetch that reports through
   * `onResolved` (the payload, or `fallback` on failure) only if `key` is still the latest once it
   * settles.
   */
  request(
    key: string,
    fallback: LifeStoryPayload,
    onResolved: (payload: LifeStoryPayload) => void,
  ): LifeStoryState {
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
