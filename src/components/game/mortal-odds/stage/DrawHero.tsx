import { AnimatePresence, motion } from "framer-motion";
import { GlobeIcon } from "@/components/assets/GlobeIcon";
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

  const yearLabel = isDrawing ? fmtYear(props.displayYear ?? 0) : props.draw ? fmtYear(props.draw.year) : "?";

  return (
    <div className="flex w-full flex-col items-center gap-1 text-center">
      <p className="font-semibold text-[#9181F0] text-[10px] uppercase tracking-[0.2em]">Your person</p>

      <p className={`font-bold text-4xl text-[#F5B83D] leading-none ${isDrawing ? "opacity-55" : ""}`}>{yearLabel}</p>

      <AnimatePresence>
        {props.draw && (
          <motion.div
            key={`${props.draw.year}-${props.draw.region}-${props.draw.place.name}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1"
          >
            <GlobeIcon width={13} height="13" className="text-[#5EEAD4]" />
            <span className="font-semibold text-white text-xs">{REGIONS[props.draw.region]}</span>
          </motion.div>
        )}
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
          <span className="text-white/50">{props.context.local}</span>{" "}
          <span className="text-white/50">{props.context.when}</span>
        </motion.p>
      ) : (
        <div className="mt-1 max-w-md">
          <p className="font-bold text-sm text-white">Nobody drawn yet.</p>
          <p className="text-white/50 text-xs">{IDLE_DESCRIPTION}</p>
        </div>
      )}

      <div className="mt-1 w-full max-w-sm">
        <HistoryTimeline year={props.draw?.year ?? null} currentYear={props.currentYear} />
      </div>

      <button
        type="button"
        disabled={isDrawing}
        onClick={props.onDraw}
        className="purple-gradient mt-1 rounded-full px-5 py-2 font-bold text-sm text-white shadow-[0_0_16px_rgba(103,82,239,0.5)] disabled:opacity-40"
      >
        🎲 {props.draw ? "Draw another human" : "Draw a human"}
      </button>
    </div>
  );
};
