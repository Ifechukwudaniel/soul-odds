"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PopulationChart } from "@/components/game/mortal-odds/stage/draw/PopulationChart";
import { HUMANS_EVER, worldPopCurve } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { fmtNumber, fmtPeople, fmtYear, periodName } from "@/lib/mortal-odds/format";
import { serifFont } from "@/styles/serif-font";

const INTRO =
  "Almost everyone who ever lived was born recently, because population grew exponentially, so a random birth is far more likely to fall near the present.";

export const WhenSlide = (props: {
  year: number;
  displayYear: number | null;
  isSpinning: boolean;
  when: string;
  currentYear: number;
}) => {
  const [displayYear, setDisplayYear] = useState<number | null>(props.displayYear);
  const world = interpolate({ points: worldPopCurve, x: props.year });
  const share = (world / HUMANS_EVER) * 100;
  const yearsAgo = props.currentYear - props.year;
  const spinningYear = displayYear ?? props.displayYear ?? 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto text-center">
      <h2 className={`${serifFont.className} font-bold text-3xl text-white sm:text-4xl`}>In which age?</h2>
      <p className="max-w-lg text-[0.8rem] text-white/50">{INTRO}</p>

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
          className={`${serifFont.className} flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center font-bold text-xl text-white sm:text-xl`}
        >
          <span>{fmtYear(props.year)}</span>
          <span className="text-white/40">·</span>
          <span>{fmtNumber(yearsAgo)} years ago</span>
          <span className="text-white/40">·</span>
          <span>the {periodName(props.year).toLowerCase()}</span>
        </motion.p>
      )}

      {props.isSpinning ? (
        <p className="text-sm text-white/40">Reaching into history…</p>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="max-w-md text-[0.8rem] text-white/60"
        >
          when about <b className="text-white">{fmtPeople(world)}</b> people were alive ({share.toFixed(2)}% of all humans, ever)
        </motion.p>
      )}
    </div>
  );
};
