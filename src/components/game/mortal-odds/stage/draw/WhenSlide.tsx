"use client";

import { motion } from "framer-motion";
import { HistoryTimeline } from "@/components/game/mortal-odds/stage/HistoryTimeline";
import { fmtYear } from "@/lib/mortal-odds/format";

export const WhenSlide = (props: {
  year: number;
  displayYear: number | null;
  isSpinning: boolean;
  when: string;
  currentYear: number;
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
    <p className="font-medium text-white/50 text-[11px] uppercase tracking-[0.2em]">Your person was born</p>

    <motion.p
      key={props.isSpinning ? "spinning" : "settled"}
      initial={props.isSpinning ? false : { scale: 1.25, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 210, damping: 18 }}
      className={`font-bold text-5xl tabular-nums sm:text-6xl ${props.isSpinning ? "text-white/40" : "text-white"}`}
    >
      {fmtYear(props.isSpinning ? (props.displayYear ?? 0) : props.year)}
    </motion.p>

    {props.isSpinning ? (
      <p className="text-sm text-white/40">Reaching into history…</p>
    ) : (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="max-w-md text-sm text-white/60"
      >
        {props.when}
      </motion.p>
    )}

    <div className="mt-2 w-full max-w-sm">
      <HistoryTimeline year={props.isSpinning ? null : props.year} currentYear={props.currentYear} />
    </div>
  </div>
);
