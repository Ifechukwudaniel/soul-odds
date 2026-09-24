/** Linear interpolation over a sorted [x, y] point list, clamped at both ends. */
export function interpolate(options: {
  points: ReadonlyArray<readonly [number, number]>;
  x: number;
}): number {
  const { points, x } = options;
  const first = points[0];
  if (!first) throw new Error('interpolate: points must not be empty');
  if (x <= first[0]) return first[1];

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    const [x1, y1] = point;
    if (x <= x1) {
      const prev = points[i - 1];
      if (!prev) continue;
      const [x0, y0] = prev;
      const t = (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * t;
    }
  }

  const last = points[points.length - 1];
  if (!last) throw new Error('interpolate: points must not be empty');
  return last[1];
}
