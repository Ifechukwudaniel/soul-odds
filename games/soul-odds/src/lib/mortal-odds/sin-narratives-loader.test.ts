import { describe, expect, it, vi } from "vitest";
import { sinNarrativesKeyFor, SinNarrativesLoader } from "@/lib/mortal-odds/sin-narratives-loader";
import type { SinNarratives } from "@/lib/mortal-odds/sin-variants";

const narratives = (label: string): SinNarratives =>
  ({
    violence: { label, phrase: `${label} phrase` },
    deceit: { label, phrase: `${label} phrase` },
    greed: { label, phrase: `${label} phrase` },
    heresy: { label, phrase: `${label} phrase` },
  }) as SinNarratives;

const fallback = narratives("fallback");

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("sinNarrativesKeyFor", () => {
  it("keys a draw by year and place", () => {
    expect(sinNarrativesKeyFor(1350, "Lyon, Europe")).toBe("1350:Lyon, Europe");
  });
});

describe("SinNarrativesLoader", () => {
  it("reports not ready and fetches once for a fresh key", async () => {
    const generated = narratives("generated");
    const fetchNarratives = vi.fn().mockResolvedValue(generated);
    const loader = new SinNarrativesLoader({ fetchNarratives });
    const onResolved = vi.fn();

    const state = loader.request("328:Wusun", fallback, onResolved);

    expect(state).toEqual({ ready: false });
    expect(fetchNarratives).toHaveBeenCalledTimes(1);
    expect(fetchNarratives).toHaveBeenCalledWith("328:Wusun");
    await Promise.resolve();
    expect(onResolved).toHaveBeenCalledWith(generated);
  });

  it("returns a cached result as ready, without fetching again", async () => {
    const generated = narratives("generated");
    const fetchNarratives = vi.fn().mockResolvedValue(generated);
    const loader = new SinNarrativesLoader({ fetchNarratives });

    loader.request("328:Wusun", fallback, vi.fn());
    await Promise.resolve();
    const state = loader.request("328:Wusun", fallback, vi.fn());

    expect(state).toEqual({ ready: true, narratives: generated });
    expect(fetchNarratives).toHaveBeenCalledTimes(1);
  });

  it("fetches a draw's narratives only once across repeated requests", () => {
    const fetchNarratives = vi.fn().mockReturnValue(new Promise<SinNarratives>(() => {}));
    const loader = new SinNarrativesLoader({ fetchNarratives });

    loader.request("328:Wusun", fallback, vi.fn());
    loader.request("328:Wusun", fallback, vi.fn());
    loader.request("328:Wusun", fallback, vi.fn());

    expect(fetchNarratives).toHaveBeenCalledTimes(1);
  });

  it("delivers the fallback through onResolved once the fetch definitively fails", async () => {
    const loader = new SinNarrativesLoader({ fetchNarratives: () => Promise.reject(new Error("openrouter down")) });
    const onResolved = vi.fn();

    const state = loader.request("328:Wusun", fallback, onResolved);
    await Promise.resolve().then(() => Promise.resolve());

    expect(state).toEqual({ ready: false });
    expect(onResolved).toHaveBeenCalledWith(fallback);
  });

  describe("retreating and redrawing the land before the previous fetch arrives", () => {
    it("ignores a slow, stale response for the draw the player already left", async () => {
      const oldRequest = deferred<SinNarratives>();
      const newNarratives = narratives("new draw");
      const fetchNarratives = vi.fn().mockImplementation((key: string) => (key === "328:Wusun" ? oldRequest.promise : Promise.resolve(newNarratives)));
      const loader = new SinNarrativesLoader({ fetchNarratives });
      const onResolvedOld = vi.fn();
      const onResolvedNew = vi.fn();

      loader.request("328:Wusun", fallback, onResolvedOld);
      // The player retreats past "where", redraws the land, and confirms a new one.
      loader.request("1150:Angkor", fallback, onResolvedNew);

      oldRequest.resolve(narratives("stale"));
      await Promise.resolve();
      await Promise.resolve();

      expect(onResolvedOld).not.toHaveBeenCalled();
      expect(onResolvedNew).toHaveBeenCalledWith(newNarratives);
    });

    it("ignores a stale failure for the draw the player already left", async () => {
      const oldRequest = deferred<SinNarratives>();
      const newNarratives = narratives("new draw");
      const fetchNarratives = vi.fn().mockImplementation((key: string) => (key === "328:Wusun" ? oldRequest.promise : Promise.resolve(newNarratives)));
      const loader = new SinNarrativesLoader({ fetchNarratives });
      const onResolvedOld = vi.fn();
      const onResolvedNew = vi.fn();

      loader.request("328:Wusun", fallback, onResolvedOld);
      loader.request("1150:Angkor", fallback, onResolvedNew);

      oldRequest.reject(new Error("openrouter down"));
      await Promise.resolve().then(() => Promise.resolve());

      expect(onResolvedOld).not.toHaveBeenCalled();
      expect(onResolvedNew).toHaveBeenCalledWith(newNarratives);
    });
  });
});
