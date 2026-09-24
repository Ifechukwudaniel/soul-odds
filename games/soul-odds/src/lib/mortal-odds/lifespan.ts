/** 21 five-year bins (0-5, 5-10, ..., 100+), as a share of the sample. */
export function histogram(samples: ReadonlyArray<{ age: number }>): number[] {
  const bins: number[] = new Array(21).fill(0);
  for (const s of samples) {
    const index = Math.min(20, Math.floor(s.age / 5));
    bins[index] = (bins[index] ?? 0) + 1;
  }
  return bins.map((count) => count / samples.length);
}

export type LifespanHistogram = { binSize: number; real: number[]; bookie: number[] };

/** Real (full model) vs bookie (year-only) age-at-death distributions, same bins for both. */
export function buildLifespanHistogram(options: {
  truthSamples: ReadonlyArray<{ age: number }>;
  bookieSamples: ReadonlyArray<{ age: number }>;
}): LifespanHistogram {
  return {
    binSize: 5,
    real: histogram(options.truthSamples),
    bookie: histogram(options.bookieSamples),
  };
}

/**
 * Caps infant-death bars at twice the tallest adult bin, so a high child-mortality era
 * doesn't flatten the rest of the chart. Bin 0 (ages 0-5) is excluded from the cap itself.
 */
export function lifespanCap(chart: LifespanHistogram): number {
  const adultBins = [...chart.real.slice(1), ...chart.bookie.slice(1)];
  return Math.max(...adultBins) * 2;
}

/** Median age across a batch of samples, used to mark "typical" lifespan on the chart. */
export function medianAge(samples: ReadonlyArray<{ age: number }>): number {
  const sorted = [...samples].map((s) => s.age).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid] ?? 0;
}
