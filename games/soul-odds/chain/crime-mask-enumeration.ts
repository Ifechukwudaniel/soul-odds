// The sampler's exact crime-state distribution, enumerated rather than derived in closed form.
// Heavy (millions of iterations per era), so only the generator script and its test run it; the
// result is checked in as era-crime-masks.json.
//
// ⬢ The second crime step reads BOTH its 25% chance and its index from one value `x`
// (`x % 10000`, `x % total`), so it is enumerated over one period of (10000, total).
const BPS = 10_000;
const SECOND_CRIME_BPS = 2_500;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export type CrimeMaskCounts = { denominator: string; counts: Record<string, string> };

export function exactCrimeMaskCounts(selectionWeights: readonly number[]): CrimeMaskCounts {
  const total = selectionWeights.reduce((sum, weight) => sum + weight, 0);
  const period = (BPS / gcd(BPS, total)) * total;
  const counts = new Map<number, bigint>();

  for (let first = 0; first < selectionWeights.length; first++) {
    const weight = BigInt(selectionWeights[first]!);
    if (weight === 0n) continue;
    // ✦ Tallied per period in plain numbers, scaled by the first-draw weight once at the end.
    const perMask = new Map<number, number>();
    for (let x = 0; x < period; x++) {
      let mask = 1 << first;
      if (x % BPS < SECOND_CRIME_BPS) {
        const second = x % total;
        let cumulative = 0;
        for (let j = 0; j < selectionWeights.length; j++) {
          cumulative += selectionWeights[j]!;
          if (second < cumulative && (mask & (1 << j)) === 0) {
            mask |= 1 << j;
            break;
          }
        }
      }
      perMask.set(mask, (perMask.get(mask) ?? 0) + 1);
    }
    for (const [mask, count] of perMask) {
      counts.set(mask, (counts.get(mask) ?? 0n) + weight * BigInt(count));
    }
  }

  return {
    denominator: (BigInt(total) * BigInt(period)).toString(),
    counts: Object.fromEntries(
      [...counts].sort((a, b) => a[0] - b[0]).map(([mask, count]) => [mask, count.toString()]),
    ),
  };
}
