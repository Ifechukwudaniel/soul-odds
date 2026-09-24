const VIEWBOX_X0 = 10;
const VIEWBOX_WIDTH = 580;

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

/** Log-scale x position (0-600 viewBox) for a birth year, most recent years on the right. */
export function timelineX(options: { year: number; currentYear: number }): number {
  const { year, currentYear } = options;
  const tMin = Math.log10(10);
  const tMax = Math.log10(currentYear + 6000 + 10);
  const t = (Math.log10(currentYear - year + 10) - tMin) / (tMax - tMin);
  return VIEWBOX_X0 + VIEWBOX_WIDTH * (1 - clamp(t, 0, 1));
}

export const TIMELINE_TICKS: ReadonlyArray<{ year: 'now' | number; label: string }> = [
  { year: -6000, label: '6k BCE' },
  { year: -3000, label: '3k BCE' },
  { year: 1, label: '1 CE' },
  { year: 1500, label: '1500' },
  { year: 1900, label: '1900' },
  { year: 'now', label: 'Now' },
];

export type TimelineTickPosition = { x: number; label: string; anchor: 'start' | 'middle' | 'end' };

/** Resolves TIMELINE_TICKS to concrete x positions and text anchors for rendering. */
export function timelineTickPositions(options: { currentYear: number }): TimelineTickPosition[] {
  const { currentYear } = options;
  return TIMELINE_TICKS.map((tick, index) => {
    const year = tick.year === 'now' ? currentYear : tick.year;
    const anchor = index === 0 ? 'start' : index === TIMELINE_TICKS.length - 1 ? 'end' : 'middle';
    return { x: timelineX({ year, currentYear }), label: tick.label, anchor };
  });
}
