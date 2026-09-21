"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PopulationChart } from "@/components/game/mortal-odds/stage/draw/PopulationChart";
import { fmtNumber, fmtYear, periodName } from "@/lib/mortal-odds/format";
import { serifFont } from "@/styles/serif-font";

const INTRO =
  "Most births happened recently in history.";

export const WhenSlide = (props: {
  year: number;
  displayYear: number | null;
  isSpinning: boolean;
  story: string;
  currentYear: number;
}) => {
  const [displayYear, setDisplayYear] = useState<number | null>(props.displayYear);
  const yearsAgo = props.currentYear - props.year;
  const spinningYear = displayYear ?? props.displayYear ?? 0;

  return (
    <div className="flex min-h-full flex-col items-center  gap-5 text-center">
      <h2 className={`${serifFont.className} font-bold text-3xl text-[#F1D6AE] sm:text-4xl leading-[0.55] pt-[0.5rem]`}>In which age?</h2>
      <p className="max-w-lg text-[0.8rem] text-[#f1f1f2c0]">{INTRO}</p>

      <div className="w-full max-w-2xl">
        <PopulationChart
          year={props.year}
          currentYear={props.currentYear}
          isSpinning={props.isSpinning}
          onYearChange={setDisplayYear}
        />
      </div>

      {props.isSpinning ? (
        <div className="relative h-[1.3em] w-full overflow-hidden text-4xl sm:text-5xl">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={spinningYear}
              initial={{ y: "-60%", opacity: 0, filter: "blur(4px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "60%", opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.09, ease: "easeOut" }}
              className={`${serifFont.className} absolute inset-0 flex items-center justify-center font-bold text-white/50 tabular-nums`}
            >
              {fmtYear(spinningYear)}
            </motion.p>
          </AnimatePresence>
        </div>
      ) : (
        <motion.p
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className={`${serifFont.className} flex flex-col items-center justify-center px-2 text-center font-bold text-xl text-white sm:text-xl `}
      >
        <span className="flex items-center justify-center gap-x-2">
          <span>{fmtYear(props.year)}</span>
          <span className="text-white/40">·</span>
          <span >{fmtNumber(yearsAgo)} years ago</span>
        </span>
      
        <span className="mt-1 text-[0.9rem] text-[#DEAE56] ">
          the {periodName(props.year).toLowerCase()}
        </span>
      </motion.p>
      )}

      {props.isSpinning ? (
        <p className="text-sm text-white/40">Reaching into history…</p>
      ) : (
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
