import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createLocalStorageLifeStoryCache,
  LifeStoryLoader,
} from '@/lib/mortal-odds/life-story-loader';
import type { LifeStoryPayload } from '@/lib/mortal-odds/life-story-loader';

const payload = (story: string, name: string | null = null): LifeStoryPayload => ({ story, name });
const fallback = payload('fallback story');

function memoryCache() {
  const store = new Map<string, LifeStoryPayload>();
  return {
    read: (key: string) => store.get(key) ?? null,
    write: (key: string, value: LifeStoryPayload) => void store.set(key, value),
  };
}

/** Resolves on demand instead of immediately, so tests can control arrival order. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('LifeStoryLoader', () => {
  it('reports not ready and fetches once for a fresh key', async () => {
    const generated = payload('generated story', 'Isabeau');
    const fetchStory = vi.fn().mockResolvedValue(generated);
    const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });
    const onResolved = vi.fn();

    const state = loader.request('session-1', fallback, onResolved);

    expect(state).toEqual({ ready: false });
    expect(fetchStory).toHaveBeenCalledTimes(1);
    expect(fetchStory).toHaveBeenCalledWith('session-1');
    await Promise.resolve();
    expect(onResolved).toHaveBeenCalledWith(generated);
  });

  it('returns a cached payload as ready, without fetching', () => {
    const cache = memoryCache();
    const cached = payload('cached story', 'Marcus');
    cache.write('session-1', cached);
    const fetchStory = vi.fn().mockResolvedValue(payload('generated story'));
    const loader = new LifeStoryLoader({ cache, fetchStory });

    const state = loader.request('session-1', fallback, vi.fn());

    expect(state).toEqual({ ready: true, payload: cached });
    expect(fetchStory).not.toHaveBeenCalled();
  });

  it("fetches a session's story only once across repeated requests", () => {
    const fetchStory = vi.fn().mockReturnValue(new Promise<LifeStoryPayload>(() => {}));
    const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });

    loader.request('session-1', fallback, vi.fn());
    loader.request('session-1', fallback, vi.fn());
    loader.request('session-1', fallback, vi.fn());

    expect(fetchStory).toHaveBeenCalledTimes(1);
  });

  it('writes a resolved payload to the cache under its own key', async () => {
    const cache = memoryCache();
    const generated = payload('generated story', 'Isabeau');
    const loader = new LifeStoryLoader({ cache, fetchStory: () => Promise.resolve(generated) });

    loader.request('session-1', fallback, vi.fn());
    await Promise.resolve();

    expect(cache.read('session-1')).toEqual(generated);
  });

  it('delivers the fallback through onResolved once the fetch definitively fails', async () => {
    const loader = new LifeStoryLoader({
      cache: memoryCache(),
      fetchStory: () => Promise.reject(new Error('openrouter down')),
    });
    const onResolved = vi.fn();

    const state = loader.request('session-1', fallback, onResolved);
    await Promise.resolve().then(() => Promise.resolve());

    expect(state).toEqual({ ready: false });
    expect(onResolved).toHaveBeenCalledWith(fallback);
  });

  describe('summoning another soul before the previous story arrives', () => {
    it('ignores a slow, stale response for the round the player already left', async () => {
      const oldRequest = deferred<LifeStoryPayload>();
      const newPayload = payload("new soul's story", 'Tariq');
      const fetchStory = vi
        .fn()
        .mockImplementation((key: string) =>
          key === 'session-old' ? oldRequest.promise : Promise.resolve(newPayload),
        );
      const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });
      const onResolvedOld = vi.fn();
      const onResolvedNew = vi.fn();

      const stateForOld = loader.request(
        'session-old',
        payload("old soul's local story"),
        onResolvedOld,
      );
      expect(stateForOld).toEqual({ ready: false });

      // The player summons another soul before the old round's OpenRouter request lands.
      const stateForNew = loader.request(
        'session-new',
        payload("new soul's local story"),
        onResolvedNew,
      );
      expect(stateForNew).toEqual({ ready: false });

      // The stale request for the abandoned round finally resolves.
      oldRequest.resolve(payload("old soul's story, written in the land of Java", 'Old Soul'));
      await Promise.resolve();
      await Promise.resolve();

      expect(onResolvedOld).not.toHaveBeenCalled();
      expect(onResolvedNew).toHaveBeenCalledWith(newPayload);
    });

    it('ignores a stale failure for the round the player already left', async () => {
      const oldRequest = deferred<LifeStoryPayload>();
      const newPayload = payload("new soul's story", 'Tariq');
      const fetchStory = vi
        .fn()
        .mockImplementation((key: string) =>
          key === 'session-old' ? oldRequest.promise : Promise.resolve(newPayload),
        );
      const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });
      const onResolvedOld = vi.fn();
      const onResolvedNew = vi.fn();

      loader.request('session-old', payload('old fallback'), onResolvedOld);
      loader.request('session-new', payload('new fallback'), onResolvedNew);

      oldRequest.reject(new Error('openrouter down'));
      await Promise.resolve().then(() => Promise.resolve());

      expect(onResolvedOld).not.toHaveBeenCalled();
      expect(onResolvedNew).toHaveBeenCalledWith(newPayload);
    });

    it('still caches a stale response under its own session key', async () => {
      const oldRequest = deferred<LifeStoryPayload>();
      const cache = memoryCache();
      const newPayload = payload('new story', 'Tariq');
      const oldPayload = payload('old story', 'Old Soul');
      const loader = new LifeStoryLoader({
        cache,
        fetchStory: (key) =>
          key === 'session-old' ? oldRequest.promise : Promise.resolve(newPayload),
      });

      loader.request('session-old', payload('old fallback'), vi.fn());
      loader.request('session-new', payload('new fallback'), vi.fn());
      oldRequest.resolve(oldPayload);
      await Promise.resolve();
      await Promise.resolve();

      expect(cache.read('session-old')).toEqual(oldPayload);
      expect(cache.read('session-new')).toEqual(newPayload);
    });

    it('resumes applying updates once the player returns to the latest key', async () => {
      const generated = payload('story', 'Isabeau');
      const loader = new LifeStoryLoader({
        cache: memoryCache(),
        fetchStory: () => Promise.resolve(generated),
      });
      const onResolved = vi.fn();

      // Real usage always passes the same setState setter as `onResolved`, so a re-render that
      // re-requests the same key (still the latest) still gets the eventual result.
      loader.request('session-a', payload('fallback a'), onResolved);
      loader.request('session-a', payload('fallback a'), onResolved);
      await Promise.resolve();

      expect(onResolved).toHaveBeenCalledWith(generated);
    });
  });
});

describe('createLocalStorageLifeStoryCache', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("namespaces keys so it can't collide with other localStorage users", () => {
    const cache = createLocalStorageLifeStoryCache();
    const value = payload('a story', 'Isabeau');
    cache.write('session-1', value);
    expect(store.get('mortal-odds-life-story:v2:session-1')).toBe(JSON.stringify(value));
    expect(cache.read('session-1')).toEqual(value);
  });

  it('ignores unparseable or malformed cached data', () => {
    store.set('mortal-odds-life-story:v2:session-1', '{not json');
    expect(createLocalStorageLifeStoryCache().read('session-1')).toBeNull();

    store.set('mortal-odds-life-story:v2:session-2', JSON.stringify({ story: 42, name: null }));
    expect(createLocalStorageLifeStoryCache().read('session-2')).toBeNull();
  });

  it('survives storage that throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    const cache = createLocalStorageLifeStoryCache();
    expect(cache.read('session-1')).toBeNull();
    expect(() => cache.write('session-1', payload('story'))).not.toThrow();
  });
});
