"use client";

import { motion } from "framer-motion";
import { PopulationChart } from "@/components/game/mortal-odds/stage/draw/PopulationChart";
import { YearReel } from "@/components/game/mortal-odds/stage/draw/YearReel";
import { fmtNumber, fmtYear, periodName } from "@/lib/mortal-odds/format";
import { serifFont } from "@/styles/serif-font";

const INTRO =
  "Most births happened recently in history.";

// The reel settles with a springy punch, so the answer lands with weight.
const REEL_VARIANTS = {
  spinning: { scale: 1 },
  locked: { scale: [1.12, 1], transition: { type: "spring" as const, stiffness: 300, damping: 12 } },
};

export const WhenSlide = (props: {
  year: number;
  displayYear: number | null;
  isSpinning: boolean;
  story: string;
  currentYear: number;
}) => {
  const yearsAgo = props.currentYear - props.year;
  // While spinning the reel follows the spin timeline (starting from today); afterwards it holds the answer.
  const reelYear = props.isSpinning ? (props.displayYear ?? props.currentYear) : props.year;

  return (
    <div className="flex min-h-full flex-col items-center  gap-5 text-center">
      <h2 className={`${serifFont.className} font-bold text-3xl text-[#F1D6AE] sm:text-4xl leading-[0.55] pt-[0.5rem]`}>In which age?</h2>
      <p className="max-w-lg text-[0.8rem] text-[#f1f1f2c0]">{INTRO}</p>

      <div className="w-full max-w-2xl">
        <PopulationChart
          year={props.year}
          currentYear={props.currentYear}
          isSpinning={props.isSpinning}
          displayYear={props.displayYear}
        />
      </div>

      {/* Screen readers skip the rolling digits and hear the settled answer once, when the region updates. */}
      <div aria-live="polite" className="flex flex-col items-center gap-5">
        <motion.div
          initial={false}
          animate={props.isSpinning ? "spinning" : "locked"}
          variants={REEL_VARIANTS}
          role={props.isSpinning ? undefined : "img"}
          aria-label={props.isSpinning ? undefined : fmtYear(props.year)}
          aria-hidden={props.isSpinning || undefined}
          className={`${serifFont.className} font-bold text-4xl tabular-nums transition-colors duration-500 sm:text-5xl ${props.isSpinning ? "text-white/50" : "text-white"}`}
        >
          <YearReel year={reelYear} landing={reelYear === props.year} />
        </motion.div>

        {props.isSpinning ? (
          <p className="text-sm text-white/40">Reaching into history…</p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className={`${serifFont.className} flex flex-col items-center justify-center px-2 text-center font-bold text-xl text-white`}
          >
            <span>{fmtNumber(yearsAgo)} years ago</span>
            <span className="mt-1 text-[0.9rem] text-[#DEAE56]">the {periodName(props.year).toLowerCase()}</span>
          </motion.p>
        )}
      </div>

      {props.isSpinning ? null : (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="max-w-md text-[0.85rem] text-white/75 italic leading-relaxed"
        >
          {props.story}
        </motion.p>
      )}
    </div>
  );
};
