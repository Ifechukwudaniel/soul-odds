import { AnimatePresence, motion } from "framer-motion";
import { FaDiceD6 } from "react-icons/fa";
import { DrawStatCard } from "@/components/game/mortal-odds/stage/DrawStatCard";
import { HistoryTimeline } from "@/components/game/mortal-odds/stage/HistoryTimeline";
import { REGIONS } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import type { MortalOddsDrawPhase } from "@/hooks/useMortalOddsDraw";
import type { Draw, PlaceContext } from "@/types";

const IDLE_DESCRIPTION =
  "You'll be dealt a random human from all of history. The bookie sets the odds using only the birth year. Use the clues to make your predictions.";

export const DrawHero = (props: {
  phase: MortalOddsDrawPhase;
  draw: Draw | null;
  context: PlaceContext | null;
  displayYear: number | null;
  currentYear: number;
  onDraw: () => void;
}) => {
  const isDrawing = props.phase === "drawing";

  const yearLabel = isDrawing ? fmtYear(props.displayYear ?? 0) : props.draw ? fmtYear(props.draw.year) : "0000";
  const regionLabel = props.draw ? REGIONS[props.draw.region] : "—";

  return (
    <div className="flex w-full flex-col items-center gap-1 text-center mt-[10rem]">
      <p className="font-medium text-white/80 text-[11px] uppercase tracking-[0.2em]">Your person</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={props.draw ? `${props.draw.year}-${props.draw.region}-${props.draw.place.name}` : "empty"}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: isDrawing ? 0.55 : 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <DrawStatCard yearLabel={yearLabel} regionLabel={regionLabel} />
        </motion.div>
      </AnimatePresence>

      {isDrawing ? (
        <p className="mt-1 text-sm text-white/70">Drawing…</p>
      ) : props.draw && props.context ? (
        <motion.p
          key={`${props.draw.year}-${props.draw.region}-${props.draw.place.name}-context`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-1 max-w-md text-sm text-white/70"
        >
          Born in <b className="text-white">{props.context.where}</b>.{" "}
          <span className="text-[#b0aeb5]">{props.context.local}</span>{" "}
          <span className="text-[#b0aeb5]">{props.context.when}</span>
        </motion.p>
      ) : (
        <div className="mt-1 max-w-md">
          <p className="font-medium text-sm text-white">Nobody drawn yet.</p>
          <p className="text-[#b0aeb5] text-xs mb-12 mt-1 leading-[1.5]">{IDLE_DESCRIPTION}</p>
        </div>
      )}

      <button
        type="button"
        disabled={isDrawing}
        onClick={props.onDraw}
        className="chamfer-btn chamfer-btn-glow mt-1 flex items-center gap-3 px-8 py-3 font-bold text-base text-white disabled:opacity-40"
      >
        <FaDiceD6 size={20} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
        <span className="tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">
          {props.draw ? "Draw another human" : "Draw a human"}
        </span>
      </button>

      <div className="mt-12 w-full max-w-sm">
        <HistoryTimeline year={props.draw?.year ?? null} currentYear={props.currentYear} />
      </div>
    </div>
  );
};
