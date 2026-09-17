import { interpolate } from "@/lib/mortal-odds/curves";
import { worldPopCurve } from "@/lib/mortal-odds/config";

const WIDTH = 900;
const HEIGHT = 220;
const LEFT = 40;
const RIGHT = 40;
const TOP = 16;
const BOTTOM = 34;
const PLOT_WIDTH = WIDTH - LEFT - RIGHT;
const PLOT_HEIGHT = HEIGHT - TOP - BOTTOM;

function yearsBeforePresent(year: number, currentYear: number): number {
  return Math.max(0, currentYear - year);
}

function xForYear(year: number, currentYear: number, logMax: number): number {
  const t = Math.log10(yearsBeforePresent(year, currentYear) + 1) / logMax;
  return LEFT + PLOT_WIDTH * (1 - t);
}

function yForPop(pop: number, maxPop: number): number {
  return TOP + PLOT_HEIGHT * (1 - pop / maxPop);
}

const TICK_YEARS = [-50000, -8000, 1, 1500, 1900] as const;
const TICK_LABELS = ["50k", "10k", "2k", "500", "100"];

/** World population over time (log years-before-present), with a marker at the drawn year. */
export const PopulationChart = (props: { year: number; currentYear: number }) => {
  const logMax = Math.log10(yearsBeforePresent(-50000, props.currentYear) + 1);
  const maxPop = interpolate({ points: worldPopCurve, x: props.currentYear });

  const points = worldPopCurve
    .filter(([year]) => year <= props.currentYear)
    .map(([year, pop]) => [xForYear(year, props.currentYear, logMax), yForPop(pop, maxPop)] as const);
  points.push([xForYear(props.currentYear, props.currentYear, logMax), yForPop(maxPop, maxPop)]);

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.[0]} ${TOP + PLOT_HEIGHT} L${points[0]?.[0]} ${TOP + PLOT_HEIGHT} Z`;

  const markerX = xForYear(props.year, props.currentYear, logMax);
  const markerY = yForPop(interpolate({ points: worldPopCurve, x: props.year }), maxPop);

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#101a3d]/60 p-4">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full text-white" role="img" aria-label="World population over time">
        <line x1={LEFT} x2={WIDTH - RIGHT} y1={TOP + PLOT_HEIGHT} y2={TOP + PLOT_HEIGHT} stroke="currentColor" strokeOpacity={0.15} />
        <path d={areaPath} fill="#4C6FD1" fillOpacity={0.18} />
        <path d={linePath} fill="none" stroke="#4C6FD1" strokeWidth={2} />

        {TICK_YEARS.map((year, i) => {
          const x = xForYear(year, props.currentYear, logMax);
          return (
            <g key={year}>
              <line x1={x} x2={x} y1={TOP} y2={TOP + PLOT_HEIGHT} stroke="currentColor" strokeOpacity={0.06} />
              <text x={x} y={HEIGHT - 12} textAnchor="middle" fontSize={12} fill="currentColor" fillOpacity={0.4}>
                {TICK_LABELS[i]}
              </text>
            </g>
          );
        })}
        <text x={WIDTH - RIGHT} y={HEIGHT - 12} textAnchor="end" fontSize={12} fill="currentColor" fillOpacity={0.4}>
          now
        </text>

        <line x1={markerX} x2={markerX} y1={TOP} y2={TOP + PLOT_HEIGHT} stroke="#F5B83D" strokeWidth={1.5} />
        <circle cx={markerX} cy={markerY} r={5} fill="#F5B83D" />
      </svg>
      <p className="mt-2 text-center text-white/30 text-xs">years before present · log scale · HYDE population estimates</p>
    </div>
  );
};
