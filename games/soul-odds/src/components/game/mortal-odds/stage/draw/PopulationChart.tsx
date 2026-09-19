"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { interpolate } from "@/lib/mortal-odds/curves";
import { worldPopCurve } from "@/lib/mortal-odds/config";

const WIDTH = 900;
const HEIGHT = 240;

const LEFT = 44;
const RIGHT = 44;
const TOP = 16;
const BOTTOM = 34;

const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

const PAST_FRACTION = 0.82;
const MIN_TICK_GAP_PX = 62;

const MIN_YEAR = worldPopCurve[0]![0];
const MAX_YEAR = worldPopCurve[worldPopCurve.length - 1]![0];

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatPop(pop: number): string {
  return compactNumber.format(pop);
}

function formatEraLabel(year: number): string {
  const rounded = Math.round(year);

  if (rounded < 0) return `${compactNumber.format(-rounded)} BCE`;
  if (rounded <= 1) return "1 CE";

  return `${rounded}`;
}

function makeXScale(nowYear: number) {
  const clampedNow = Math.min(Math.max(nowYear, MIN_YEAR), MAX_YEAR);

  const nowX = LEFT + PLOT_WIDTH * PAST_FRACTION;
  const rightEdge = LEFT + PLOT_WIDTH;

  const pastSpan = Math.log10(Math.max(clampedNow - MIN_YEAR, 1) + 1);
  const futureSpan = Math.max(MAX_YEAR - clampedNow, 1);

  const toX = (year: number): number => {
    if (year <= clampedNow) {
      const t =
        Math.log10(Math.max(clampedNow - year, 0) + 1) / pastSpan;

      return nowX - t * (nowX - LEFT);
    }

    const t = (year - clampedNow) / futureSpan;

    return nowX + t * (rightEdge - nowX);
  };

  const toYear = (x: number): number => {
    const clampedX = Math.min(Math.max(x, LEFT), rightEdge);

    if (clampedX <= nowX) {
      const t = (nowX - clampedX) / (nowX - LEFT);

      return clampedNow - (10 ** (t * pastSpan) - 1);
    }

    const t = (clampedX - nowX) / (rightEdge - nowX);

    return clampedNow + t * futureSpan;
  };

  return {
    toX,
    toYear,
    nowX,
    rightEdge,
    nowYear: clampedNow,
  };
}

function selectTicks(
  candidates: readonly number[],
  toX: (year: number) => number,
): number[] {
  const sorted = [...new Set(candidates)]
    .filter((year) => year >= MIN_YEAR && year <= MAX_YEAR)
    .sort((a, b) => a - b);

  const kept: number[] = [];
  let lastX = -Infinity;

  for (const year of sorted) {
    const x = toX(year);

    if (x - lastX >= MIN_TICK_GAP_PX) {
      kept.push(year);
      lastX = x;
    }
  }

  return kept;
}

const TICK_CANDIDATES = [
  MIN_YEAR,
  -8000,
  -6000,
  -4000,
  -2000,
  -1000,
  1,
  500,
  1000,
  1500,
  1800,
  1900,
  1950,
  2000,
  2025,
  2050,
  2075,
  MAX_YEAR,
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const easeInOutCubic = (t: number) => {
  return t < 0.5
    ? 4 * t ** 3
    : 1 - ((-2 * t + 2) ** 3) / 2;
};

export const PopulationChart = (props: {
  year: number;
  currentYear: number;
  isSpinning: boolean;
  onYearChange?: (year: number) => void;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hoverX, setHoverX] = useState<number | null>(null);
  const [animatedYear, setAnimatedYear] = useState(props.year);

  const scale = useMemo(
    () => makeXScale(props.currentYear),
    [props.currentYear],
  );

  const maxPop = useMemo(
    () => worldPopCurve.reduce((max, [, pop]) => Math.max(max, pop), 0),
    [],
  );

  const yForPop = (pop: number) =>
    TOP + PLOT_HEIGHT * (1 - pop / maxPop);

  /*
   * Animate the marker through history.
   *
   * The movement is deliberately NOT linear in year-space.
   * We use a few random waypoints so it looks like the picker
   * is searching through history before settling on the answer.
   */
  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const reportYear = (nextYear: number) => {
      setAnimatedYear(nextYear);
      props.onYearChange?.(Math.round(nextYear));
    };

    if (!props.isSpinning) {
      reportYear(props.year);
      return;
    }

    const startYear = scale.nowYear;
    const targetYear = clamp(props.year, MIN_YEAR, MAX_YEAR);

    const duration = 2600;
    const startTime = performance.now();

    /*
     * Random waypoints.
     *
     * Most are spread across history, with a few biased
     * toward the target so the animation naturally converges.
     */
    const waypoints = Array.from({ length: 9 }, (_, index) => {
      if (index >= 6) {
        const t = (index - 6) / 3;

        return startYear + (targetYear - startYear) * t;
      }

      const randomT = Math.random();

      /*
       * sqrt biases the random points toward the older part
       * of history, which makes the movement visually interesting
       * on your logarithmic timeline.
       */
      const biasedT = Math.sqrt(randomT);

      return MIN_YEAR + (MAX_YEAR - MIN_YEAR) * biasedT;
    });

    waypoints.push(targetYear);

    const points = [startYear, ...waypoints];

    const segmentDuration = duration / (points.length - 1);

    const animate = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed >= duration) {
        reportYear(targetYear);
        animationFrameRef.current = null;
        return;
      }

      const rawSegment = elapsed / segmentDuration;
      const segmentIndex = Math.min(
        Math.floor(rawSegment),
        points.length - 2,
      );

      const segmentProgress = rawSegment - segmentIndex;

      /*
       * Slow slightly at each random point so it feels like
       * the picker is actually considering different years.
       */
      const easedProgress =
        segmentIndex >= points.length - 4
          ? easeInOutCubic(segmentProgress)
          : easeOutCubic(segmentProgress);

      const from = points[segmentIndex]!;
      const to = points[segmentIndex + 1]!;

      const year = from + (to - from) * easedProgress;

      reportYear(year);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    reportYear(startYear);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [props.isSpinning, props.onYearChange, props.year, scale.nowYear]);

  const pastPoints = worldPopCurve
    .filter(([year]) => year <= scale.nowYear)
    .map(
      ([year, pop]) =>
        [scale.toX(year), yForPop(pop)] as const,
    );

  const futurePoints = worldPopCurve
    .filter(([year]) => year >= scale.nowYear)
    .map(
      ([year, pop]) =>
        [scale.toX(year), yForPop(pop)] as const,
    );

  const nowPop = interpolate({
    points: worldPopCurve,
    x: scale.nowYear,
  });

  const nowPoint = [
    scale.toX(scale.nowYear),
    yForPop(nowPop),
  ] as const;

  const solidPoints = [...pastPoints, nowPoint];
  const dashedPoints = [nowPoint, ...futurePoints];

  const toPath = (
    pts: readonly (readonly [number, number])[],
  ) =>
    pts
      .map(
        ([x, y], i) =>
          `${i === 0 ? "M" : "L"}${x} ${y}`,
      )
      .join(" ");

  const solidPath = toPath(solidPoints);
  const dashedPath = toPath(dashedPoints);

  const areaPath = `${solidPath}
    L${solidPoints[solidPoints.length - 1]![0]} ${TOP + PLOT_HEIGHT}
    L${solidPoints[0]![0]} ${TOP + PLOT_HEIGHT}
    Z`;

  /*
   * IMPORTANT:
   * The marker now follows animatedYear instead of props.year.
   */
  const markerPop = interpolate({
    points: worldPopCurve,
    x: animatedYear,
  });

  const markerX = scale.toX(animatedYear);
  const markerY = yForPop(markerPop);

  const ticks = useMemo(
    () => selectTicks(TICK_CANDIDATES, scale.toX),
    [scale],
  );

  const hoverYear =
    hoverX === null ? null : scale.toYear(hoverX);

  const hoverPop =
    hoverYear === null
      ? null
      : interpolate({
          points: worldPopCurve,
          x: hoverYear,
        });

  const hoverPointX =
    hoverYear === null ? null : scale.toX(hoverYear);

  const hoverPointY =
    hoverPop === null ? null : yForPop(hoverPop);

  const handlePointerMove = (
    e: React.PointerEvent<SVGSVGElement>,
  ) => {
    const svg = svgRef.current;

    if (!svg) return;

    const rect = svg.getBoundingClientRect();

    const localX =
      ((e.clientX - rect.left) / rect.width) * WIDTH;

    setHoverX(
      Math.min(
        Math.max(localX, LEFT),
        scale.rightEdge,
      ),
    );
  };

  return (
    <div className="relative w-full rounded-xl border border-white/10 bg-[#081514]/60 p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full cursor-crosshair text-white"
        role="img"
        aria-label="World population over time, with future projection"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverX(null)}
      >
        <defs>
          <linearGradient
            id="mo-pop-area"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#5fc9b8"
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor="#5fc9b8"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>

        <line
          x1={LEFT}
          x2={scale.rightEdge}
          y1={TOP + PLOT_HEIGHT}
          y2={TOP + PLOT_HEIGHT}
          stroke="currentColor"
          strokeOpacity={0.15}
        />

        <path
          d={areaPath}
          fill="url(#mo-pop-area)"
        />

        <path
          d={solidPath}
          fill="none"
          stroke="#5fc9b8"
          strokeWidth={2}
        />

        <path
          d={dashedPath}
          fill="none"
          stroke="#5fc9b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
        />

        <line
          x1={scale.nowX}
          x2={scale.nowX}
          y1={TOP}
          y2={TOP + PLOT_HEIGHT}
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeDasharray="2 3"
        />

        {ticks.map((year) => {
          const x = scale.toX(year);

          return (
            <g key={year}>
              <line
                x1={x}
                x2={x}
                y1={TOP}
                y2={TOP + PLOT_HEIGHT}
                stroke="currentColor"
                strokeOpacity={0.06}
              />

              <text
                x={x}
                y={HEIGHT - 12}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                fillOpacity={0.4}
              >
                {formatEraLabel(year)}
              </text>
            </g>
          );
        })}

        {/* Animated selection */}
        <line
          x1={markerX}
          x2={markerX}
          y1={TOP}
          y2={TOP + PLOT_HEIGHT}
          stroke="#F5B83D"
          strokeWidth={1.5}
        />

        <circle
          cx={markerX}
          cy={markerY}
          r={props.isSpinning ? 5.5 : 5}
          fill="#F5B83D"
        />

        {hoverPointX !== null &&
          hoverPointY !== null && (
            <>
              <line
                x1={hoverPointX}
                x2={hoverPointX}
                y1={TOP}
                y2={TOP + PLOT_HEIGHT}
                stroke="#FDE991"
                strokeOpacity={0.5}
                strokeWidth={1}
              />

              <circle
                cx={hoverPointX}
                cy={hoverPointY}
                r={4}
                fill="#FDE991"
                stroke="#081514"
                strokeWidth={1}
              />
            </>
          )}
      </svg>

      {hoverYear !== null &&
        hoverPop !== null &&
        hoverPointX !== null &&
        hoverPointY !== null && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-[#FDE991]/40 bg-[#081514]/95 px-2 py-1 text-xs text-white shadow-lg"
            style={{
              left: `${(hoverPointX / WIDTH) * 100}%`,
              top: `${(hoverPointY / HEIGHT) * 100}%`,
              transform: `translate(${
                hoverPointX / WIDTH > 0.85
                  ? "-100%"
                  : hoverPointX / WIDTH < 0.15
                    ? "0%"
                    : "-50%"
              }, -130%)`,
            }}
          >
            <span className="font-semibold text-[#FDE991]">
              {formatEraLabel(hoverYear)}
            </span>

            <span className="text-white/60"> · </span>

            <span>
              {formatPop(hoverPop)} people
            </span>
          </div>
        )}

      <p className="mt-2 text-center text-xs text-white/30">
        log scale before {formatEraLabel(props.currentYear)},
        projected after · HYDE / UN WPP estimates
      </p>
    </div>
  );
};