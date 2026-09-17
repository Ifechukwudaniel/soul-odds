import { motion } from "framer-motion";
import { timelineTickPositions, timelineX } from "@/lib/mortal-odds/timeline";

export const HistoryTimeline = (props: { year: number | null; currentYear: number }) => {
  const ticks = timelineTickPositions({ currentYear: props.currentYear });
  const markerX = props.year === null ? null : timelineX({ year: props.year, currentYear: props.currentYear });

  return (
    <svg
      className="mx-auto block h-auto w-full max-w-xl text-white"
      viewBox="0 0 600 44"
      role="img"
      aria-label="Where the birth year sits in human history"
    >
      <line x1={10} x2={590} y1={18} y2={18} stroke="#9181F0" strokeOpacity={0.3} />
      {ticks.map((tick) => (
        <g key={tick.label}>
          <circle cx={tick.x} cy={18} r={3} fill="#9181F0" fillOpacity={0.5} />
          <text x={tick.x} y={38} textAnchor={tick.anchor} fill="currentColor" fillOpacity={0.5} fontSize={11}>
            {tick.label}
          </text>
        </g>
      ))}
      {markerX !== null && (
        <motion.g initial={false} animate={{ x: markerX }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <circle cx={0} cy={18} r={5} fill="#9181F0" />
          <circle cx={0} cy={18} r={9} fill="#9181F0" fillOpacity={0.35} />
        </motion.g>
      )}
    </svg>
  );
};
