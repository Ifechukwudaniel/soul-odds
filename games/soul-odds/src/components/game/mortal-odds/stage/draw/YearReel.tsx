'use client';

import NumberFlow, { continuous } from '@number-flow/react';
import { yearReelParts } from '@/lib/mortal-odds/format';
import { HOP_ROLL_MS, SETTLE_ROLL_MS } from '@/lib/mortal-odds/spin-timeline';

// Quick hops ease in and out; the landing roll decelerates hard, like a reel coming to rest.
const HOP_TIMING = { duration: HOP_ROLL_MS, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' };
const SETTLE_TIMING = { duration: SETTLE_ROLL_MS, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const FADE_TIMING = { duration: 200, easing: 'ease-out' };

/**
 * A year whose digits roll through the in-between numbers whenever it changes; `landing` is the slow final roll onto the answer.
 * Hidden from assistive tech (it would read every rolling digit), so the parent must expose the settled value itself.
 */
export const YearReel = (props: { year: number; landing: boolean; className?: string }) => {
  const { value, suffix } = yearReelParts(props.year);
  const timing = props.landing ? SETTLE_TIMING : HOP_TIMING;

  return (
    <span aria-hidden="true">
      <NumberFlow
        value={value}
        suffix={suffix}
        format={{ useGrouping: value >= 10000 }}
        plugins={[continuous]}
        spinTiming={timing}
        transformTiming={timing}
        opacityTiming={FADE_TIMING}
        className={props.className}
      />
    </span>
  );
};
