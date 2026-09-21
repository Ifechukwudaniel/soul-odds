export type Rng = () => number;

/** Deterministic PRNG so the same seed always produces the same draw sequence. */
export function mulberry32(seed: number): Rng {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh entropy seed; store it to replay a `createRng(seed)` sequence later. */
export function randomSeed(): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] ?? 0;
}

/** Entropy-seeded RNG for real play; pass a numeric seed instead for deterministic tests. */
export function createRng(seed?: number): Rng {
  return mulberry32(seed ?? randomSeed());
}

export function pickWeighted<T>(options: { items: T[]; weight: (item: T) => number; rng: Rng }): T {
  const { items, weight, rng } = options;
  const first = items[0];
  if (!first) throw new Error("pickWeighted: items must not be empty");
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let r = rng() * total;
  for (const item of items) {
    r -= weight(item);
    if (r <= 0) return item;
  }
  return items[items.length - 1] ?? first;
}
