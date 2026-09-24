'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { worldPopCurve } from '@/lib/mortal-odds/config';
import { interpolate } from '@/lib/mortal-odds/curves';
import { CHART_INTRO_MS, HOP_ROLL_MS, SETTLE_ROLL_MS } from '@/lib/mortal-odds/spin-timeline';

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

// ✦ The intro is CHART_INTRO_MS long: the curve draws itself in, then the projection is revealed and the marker lands.
const INTRO_S = CHART_INTRO_MS / 1000;
const CURVE_DRAW_S = INTRO_S * 0.78;
const PROJECTION_S = INTRO_S - CURVE_DRAW_S;
const MARKER_RADIUS = 5.5;

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

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatPop(pop: number): string {
  return compactNumber.format(pop);
}

function formatEraLabel(year: number): string {
  const rounded = Math.round(year);

  if (rounded < 0) return `${compactNumber.format(-rounded)} BCE`;
  if (rounded <= 1) return '1 CE';

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
      const t = Math.log10(Math.max(clampedNow - year, 0) + 1) / pastSpan;

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

function selectTicks(candidates: readonly number[], toX: (year: number) => number): number[] {
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

const easeInOutCubic = (t: number) => {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
};

export const PopulationChart = (props: {
  year: number;
  currentYear: number;
  isSpinning: boolean;
  displayYear: number | null;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animatedYearRef = useRef(props.year);
  const solidRef = useRef<SVGPathElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const leadRef = useRef<SVGGElement>(null);
  const ticksRef = useRef<SVGGElement>(null);
  const nowLineRef = useRef<SVGLineElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const markerDotRef = useRef<SVGCircleElement>(null);

  const [hoverX, setHoverX] = useState<number | null>(null);
  const [animatedYear, setAnimatedYear] = useState(props.year);

  const scale = useMemo(() => makeXScale(props.currentYear), [props.currentYear]);

  const maxPop = useMemo(() => worldPopCurve.reduce((max, [, pop]) => Math.max(max, pop), 0), []);

  const yForPop = (pop: number) => TOP + PLOT_HEIGHT * (1 - pop / maxPop);

  // ✦ Intro (only when the chart mounts during a draw; a restored round or step back stays static):
  //   the curve draws in with DrawSVG while a lead dot rides its front and the area wipes in behind,
  //   then the dashed projection is revealed and the marker lands on "now".
  useGSAP(() => {
    const solid = solidRef.current;
    const clipRect = clipRectRef.current;
    const lead = leadRef.current;
    const ticks = ticksRef.current;
    const nowLine = nowLineRef.current;
    const marker = markerRef.current;
    const markerDot = markerDotRef.current;
    if (
      !props.isSpinning ||
      !solid ||
      !clipRect ||
      !lead ||
      !ticks ||
      !nowLine ||
      !marker ||
      !markerDot
    ) {
      return;
    }

    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const length = solid.getTotalLength();
      const front = { progress: 0 };

      gsap.set(clipRect, { attr: { width: 0 } });
      gsap.set(solid, { drawSVG: '0%' });
      gsap.set([marker, nowLine], { opacity: 0 });

      gsap
        .timeline({
          onComplete: () => gsap.set(solid, { clearProps: 'strokeDasharray,strokeDashoffset' }),
        })
        .to(
          front,
          {
            progress: 1,
            duration: CURVE_DRAW_S,
            ease: 'power2.inOut',
            onUpdate: () => {
              const point = solid.getPointAtLength(front.progress * length);
              gsap.set(solid, { drawSVG: `0% ${front.progress * 100}%` });
              gsap.set(lead, { x: point.x, y: point.y });
              gsap.set(clipRect, { attr: { width: point.x } });
            },
          },
          0,
        )
        .fromTo(lead, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0)
        .fromTo(
          ticks.querySelectorAll('text'),
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07 },
          0.15,
        )
        .to(lead, { opacity: 0, duration: 0.2 }, CURVE_DRAW_S)
        .to(
          clipRect,
          { attr: { width: WIDTH }, duration: PROJECTION_S, ease: 'power1.out' },
          CURVE_DRAW_S,
        )
        .to(nowLine, { opacity: 1, duration: 0.3 }, CURVE_DRAW_S - 0.1)
        .to(marker, { opacity: 1, duration: 0.2 }, CURVE_DRAW_S)
        .fromTo(
          markerDot,
          { attr: { r: 0 } },
          { attr: { r: MARKER_RADIUS }, duration: 0.4, ease: 'back.out(3)' },
          CURVE_DRAW_S,
        );
    });

    return () => motion.revert();
  });

  // ✦ The marker follows the spin timeline: on each new year it glides along the log-scaled axis over
  //   the reel's roll time, slowest on the final landing. Outside a spin it sits on the answer.
  useEffect(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const setYear = (year: number) => {
      animatedYearRef.current = year;
      setAnimatedYear(year);
    };

    if (!props.isSpinning) {
      setYear(props.year);
      return;
    }

    const target = clamp(props.displayYear ?? scale.nowYear, MIN_YEAR, MAX_YEAR);
    const landing = target === clamp(props.year, MIN_YEAR, MAX_YEAR);
    const rollMs = landing ? SETTLE_ROLL_MS : HOP_ROLL_MS;
    const ease = landing ? easeOutExpo : easeInOutCubic;
    const fromX = scale.toX(animatedYearRef.current);
    const toX = scale.toX(target);
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / rollMs, 1);
      setYear(progress === 1 ? target : scale.toYear(fromX + (toX - fromX) * ease(progress)));
      animationFrameRef.current = progress === 1 ? null : requestAnimationFrame(step);
    };
    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [props.displayYear, props.isSpinning, props.year, scale]);

  const pastPoints = worldPopCurve
    .filter(([year]) => year <= scale.nowYear)
    .map(([year, pop]) => [scale.toX(year), yForPop(pop)] as const);

  const futurePoints = worldPopCurve
    .filter(([year]) => year >= scale.nowYear)
    .map(([year, pop]) => [scale.toX(year), yForPop(pop)] as const);

  const nowPop = interpolate({
    points: worldPopCurve,
    x: scale.nowYear,
  });

  const nowPoint = [scale.toX(scale.nowYear), yForPop(nowPop)] as const;

  const solidPoints = [...pastPoints, nowPoint];
  const dashedPoints = [nowPoint, ...futurePoints];

  const toPath = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');

  const solidPath = toPath(solidPoints);
  const dashedPath = toPath(dashedPoints);

  const areaPath = `${solidPath}
    L${solidPoints[solidPoints.length - 1]![0]} ${TOP + PLOT_HEIGHT}
    L${solidPoints[0]![0]} ${TOP + PLOT_HEIGHT}
    Z`;

  const markerPop = interpolate({
    points: worldPopCurve,
    x: animatedYear,
  });

  const markerX = scale.toX(animatedYear);
  const markerY = yForPop(markerPop);

  const ticks = useMemo(() => selectTicks(TICK_CANDIDATES, scale.toX), [scale]);

  const hoverYear = hoverX === null ? null : scale.toYear(hoverX);

  const hoverPop =
    hoverYear === null
      ? null
      : interpolate({
          points: worldPopCurve,
          x: hoverYear,
        });

  const hoverPointX = hoverYear === null ? null : scale.toX(hoverYear);

  const hoverPointY = hoverPop === null ? null : yForPop(hoverPop);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;

    if (!svg) return;

    const rect = svg.getBoundingClientRect();

    const localX = ((e.clientX - rect.left) / rect.width) * WIDTH;

    setHoverX(Math.min(Math.max(localX, LEFT), scale.rightEdge));
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
          <clipPath id="mo-reveal">
            <rect ref={clipRectRef} x={0} y={0} width={WIDTH} height={HEIGHT} />
          </clipPath>
          <linearGradient id="mo-pop-area" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5fc9b8" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5fc9b8" stopOpacity={0.02} />
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

        <path d={areaPath} fill="url(#mo-pop-area)" clipPath="url(#mo-reveal)" />

        <path ref={solidRef} d={solidPath} fill="none" stroke="#5fc9b8" strokeWidth={2} />

        <path
          d={dashedPath}
          fill="none"
          stroke="#5fc9b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
          clipPath="url(#mo-reveal)"
        />

        <g ref={leadRef} opacity={0}>
          <circle r={11} fill="#FDE991" opacity={0.25} />
          <circle r={4} fill="#FDE991" />
        </g>

        <line
          ref={nowLineRef}
          x1={scale.nowX}
          x2={scale.nowX}
          y1={TOP}
          y2={TOP + PLOT_HEIGHT}
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeDasharray="2 3"
        />

        <g ref={ticksRef}>
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
        </g>

        {/* ✦ Animated selection ✦ */}
        <g ref={markerRef}>
          <line
            x1={markerX}
            x2={markerX}
            y1={TOP}
            y2={TOP + PLOT_HEIGHT}
            stroke="#F5B83D"
            strokeWidth={1.5}
          />

          <circle
            ref={markerDotRef}
            cx={markerX}
            cy={markerY}
            r={props.isSpinning ? MARKER_RADIUS : 5}
            fill="#F5B83D"
          />
        </g>

        {hoverPointX !== null && hoverPointY !== null && (
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

      {hoverYear !== null && hoverPop !== null && hoverPointX !== null && hoverPointY !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-[#FDE991]/40 bg-[#081514]/95 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg"
          style={{
            left: `${(hoverPointX / WIDTH) * 100}%`,
            top: `${(hoverPointY / HEIGHT) * 100}%`,
            transform: `translate(${
              hoverPointX / WIDTH > 0.85 ? '-100%' : hoverPointX / WIDTH < 0.15 ? '0%' : '-50%'
            }, -130%)`,
          }}
        >
          <span className="font-semibold text-[#FDE991]">{formatEraLabel(hoverYear)}</span>

          <span className="text-white/60"> · </span>

          <span>{formatPop(hoverPop)} people</span>
        </div>
      )}

      <p className="mt-2 text-center text-xs text-white/30">
        log scale before {formatEraLabel(props.currentYear)}, projected after · HYDE / UN WPP
        estimates
      </p>
    </div>
  );
};
