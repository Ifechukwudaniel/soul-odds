import { lifespanCap } from "@/lib/mortal-odds/lifespan";
import type { LifespanHistogram } from "@/lib/mortal-odds/lifespan";

const WIDTH = 600;
const HEIGHT = 130;
const BASE_Y = HEIGHT - 30;
const TOP_Y = 18;

function ageX(age: number): number {
  const clamped = Math.min(100, Math.max(0, age));
  return 24 + (WIDTH - 48) * (clamped / 100);
}

const TICKS = Array.from({ length: 11 }, (_, i) => i * 10);

/** Real (bars) vs bookie-assumed (dashed line) age-at-death spread, with the actual death age marked. */
export const LifespanChart = (props: { histogram: LifespanHistogram; deathAge: number }) => {
  const cap = lifespanCap(props.histogram);
  const barY = (v: number) => BASE_Y - ((BASE_Y - TOP_Y) * Math.min(v, cap)) / cap;
  const barWidth = ageX(5) - ageX(0) - 2;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full text-white"
      role="img"
      aria-label="Age at death: real spread compared with the bookie's assumption"
    >
      <line x1={ageX(0)} x2={ageX(100)} y1={BASE_Y} y2={BASE_Y} stroke="currentColor" strokeOpacity={0.2} />
      {TICKS.map((age) => (
        <g key={age}>
          <line x1={ageX(age)} x2={ageX(age)} y1={BASE_Y} y2={BASE_Y + 6} stroke="currentColor" strokeOpacity={0.2} />
          <text x={ageX(age)} y={HEIGHT - 4} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.5}>
            {age}
          </text>
        </g>
      ))}

      {props.histogram.real.map((v, i) => {
        const x = ageX(i * 5) + 1;
        const capped = v > cap;
        return (
          <g key={i}>
            <rect x={x} y={barY(v)} width={barWidth} height={BASE_Y - barY(v)} fill="#9181F0" fillOpacity={0.6} />
            {capped && (
              <text x={x + barWidth / 2} y={TOP_Y - 6} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>
                {Math.round(v * 100)}%
              </text>
            )}
          </g>
        );
      })}

      <polyline
        points={props.histogram.bookie.map((v, i) => `${ageX(i * 5 + 2.5)},${barY(v)}`).join(" ")}
        fill="none"
        stroke="#F5B83D"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      <path
        d={`M${ageX(props.deathAge) - 5} ${BASE_Y - 16} L${ageX(props.deathAge) + 5} ${BASE_Y - 4} M${ageX(props.deathAge) + 5} ${BASE_Y - 16} L${ageX(props.deathAge) - 5} ${BASE_Y - 4}`}
        stroke="#F87171"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};
