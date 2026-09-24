import { describe, expect, it } from 'vitest';
import { TIMELINE_TICKS, timelineTickPositions, timelineX } from '@/lib/mortal-odds/timeline';

const currentYear = 2024;

describe('timelineX', () => {
  it('is monotonically increasing as the year gets more recent', () => {
    const years = [-50000, -20000, -8000, -1000, 1, 1000, 1500, 1900, currentYear - 1];
    const positions = years.map((year) => timelineX({ year, currentYear }));
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1] as number);
    }
  });

  it('keeps positions within the 10-590 viewBox range', () => {
    for (const year of [-50000, -1, 1, currentYear - 1]) {
      const x = timelineX({ year, currentYear });
      expect(x).toBeGreaterThanOrEqual(10);
      expect(x).toBeLessThanOrEqual(590);
    }
  });
});

describe('timelineTickPositions', () => {
  it('returns one entry per tick with the right anchors', () => {
    const positions = timelineTickPositions({ currentYear });
    expect(positions).toHaveLength(TIMELINE_TICKS.length);
    expect(positions[0]?.anchor).toBe('start');
    expect(positions[positions.length - 1]?.anchor).toBe('end');
    for (const position of positions.slice(1, -1)) {
      expect(position.anchor).toBe('middle');
    }
  });

  it("resolves the 'now' tick to the current year's position", () => {
    const positions = timelineTickPositions({ currentYear });
    const nowTick = positions[positions.length - 1];
    expect(nowTick?.x).toBeCloseTo(timelineX({ year: currentYear, currentYear }));
  });
});
