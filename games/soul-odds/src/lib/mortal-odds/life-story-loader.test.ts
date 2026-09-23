import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalStorageLifeStoryCache, LifeStoryLoader } from "@/lib/mortal-odds/life-story-loader";

function memoryCache() {
  const store = new Map<string, string>();
  return { read: (key: string) => store.get(key) ?? null, write: (key: string, story: string) => void store.set(key, story) };
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

describe("LifeStoryLoader", () => {
  it("reports not ready and fetches once for a fresh key", async () => {
    const fetchStory = vi.fn().mockResolvedValue("generated story");
    const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });
    const onResolved = vi.fn();

    const state = loader.request("session-1", "fallback story", onResolved);

    expect(state).toEqual({ ready: false });
    expect(fetchStory).toHaveBeenCalledTimes(1);
    expect(fetchStory).toHaveBeenCalledWith("session-1");
    await Promise.resolve();
    expect(onResolved).toHaveBeenCalledWith("generated story");
  });

  it("returns a cached story as ready, without fetching", () => {
    const cache = memoryCache();
    cache.write("session-1", "cached story");
    const fetchStory = vi.fn().mockResolvedValue("generated story");
    const loader = new LifeStoryLoader({ cache, fetchStory });

    const state = loader.request("session-1", "fallback story", vi.fn());

    expect(state).toEqual({ ready: true, story: "cached story" });
    expect(fetchStory).not.toHaveBeenCalled();
  });

  it("fetches a session's story only once across repeated requests", () => {
    const fetchStory = vi.fn().mockReturnValue(new Promise<string>(() => {}));
    const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });

    loader.request("session-1", "fallback", vi.fn());
    loader.request("session-1", "fallback", vi.fn());
    loader.request("session-1", "fallback", vi.fn());

    expect(fetchStory).toHaveBeenCalledTimes(1);
  });

  it("writes a resolved story to the cache under its own key", async () => {
    const cache = memoryCache();
    const loader = new LifeStoryLoader({ cache, fetchStory: () => Promise.resolve("generated story") });

    loader.request("session-1", "fallback", vi.fn());
    await Promise.resolve();

    expect(cache.read("session-1")).toBe("generated story");
  });

  it("delivers the fallback through onResolved once the fetch definitively fails", async () => {
    const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory: () => Promise.reject(new Error("openrouter down")) });
    const onResolved = vi.fn();

    const state = loader.request("session-1", "fallback story", onResolved);
    await Promise.resolve().then(() => Promise.resolve());

    expect(state).toEqual({ ready: false });
    expect(onResolved).toHaveBeenCalledWith("fallback story");
  });

  describe("summoning another soul before the previous story arrives", () => {
    it("ignores a slow, stale response for the round the player already left", async () => {
      const oldRequest = deferred<string>();
      const fetchStory = vi.fn().mockImplementation((key: string) => (key === "session-old" ? oldRequest.promise : Promise.resolve("new soul's story")));
      const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });
      const onResolvedOld = vi.fn();
      const onResolvedNew = vi.fn();

      const stateForOld = loader.request("session-old", "old soul's local story", onResolvedOld);
      expect(stateForOld).toEqual({ ready: false });

      // The player summons another soul before the old round's OpenRouter request lands.
      const stateForNew = loader.request("session-new", "new soul's local story", onResolvedNew);
      expect(stateForNew).toEqual({ ready: false });

      // The stale request for the abandoned round finally resolves.
      oldRequest.resolve("old soul's story, written in the land of Java");
      await Promise.resolve();
      await Promise.resolve();

      expect(onResolvedOld).not.toHaveBeenCalled();
      expect(onResolvedNew).toHaveBeenCalledWith("new soul's story");
    });

    it("ignores a stale failure for the round the player already left", async () => {
      const oldRequest = deferred<string>();
      const fetchStory = vi.fn().mockImplementation((key: string) => (key === "session-old" ? oldRequest.promise : Promise.resolve("new soul's story")));
      const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory });
      const onResolvedOld = vi.fn();
      const onResolvedNew = vi.fn();

      loader.request("session-old", "old fallback", onResolvedOld);
      loader.request("session-new", "new fallback", onResolvedNew);

      oldRequest.reject(new Error("openrouter down"));
      await Promise.resolve().then(() => Promise.resolve());

      expect(onResolvedOld).not.toHaveBeenCalled();
      expect(onResolvedNew).toHaveBeenCalledWith("new soul's story");
    });

    it("still caches a stale response under its own session key", async () => {
      const oldRequest = deferred<string>();
      const cache = memoryCache();
      const loader = new LifeStoryLoader({ cache, fetchStory: (key) => (key === "session-old" ? oldRequest.promise : Promise.resolve("new story")) });

      loader.request("session-old", "old fallback", vi.fn());
      loader.request("session-new", "new fallback", vi.fn());
      oldRequest.resolve("old story");
      await Promise.resolve();
      await Promise.resolve();

      expect(cache.read("session-old")).toBe("old story");
      expect(cache.read("session-new")).toBe("new story");
    });

    it("resumes applying updates once the player returns to the latest key", async () => {
      const loader = new LifeStoryLoader({ cache: memoryCache(), fetchStory: () => Promise.resolve("story") });
      const onResolved = vi.fn();

      // Real usage always passes the same setState setter as `onResolved`, so a re-render that
      // re-requests the same key (still the latest) still gets the eventual result.
      loader.request("session-a", "fallback a", onResolved);
      loader.request("session-a", "fallback a", onResolved);
      await Promise.resolve();

      expect(onResolved).toHaveBeenCalledWith("story");
    });
  });
});

describe("createLocalStorageLifeStoryCache", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("namespaces keys so it can't collide with other localStorage users", () => {
    const cache = createLocalStorageLifeStoryCache();
    cache.write("session-1", "a story");
    expect(store.get("mortal-odds-life-story:v1:session-1")).toBe("a story");
    expect(cache.read("session-1")).toBe("a story");
  });

  it("survives storage that throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    const cache = createLocalStorageLifeStoryCache();
    expect(cache.read("session-1")).toBeNull();
    expect(() => cache.write("session-1", "story")).not.toThrow();
  });
});
