"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { GameCard } from "@/components/game/home/GameCard";
import { BetsBreakdown } from "@/components/game/mortal-odds/stage/reveal/BetsBreakdown";
import { LifespanChart } from "@/components/game/mortal-odds/stage/reveal/LifespanChart";
import { fmtYear } from "@/lib/mortal-odds/format";
import { revealBeats, visibleBetCount } from "@/lib/mortal-odds/reveal-beats";
import { playClickSound } from "@/utils/playClickSound";
import type { RevealResult } from "@/hooks/useMortalOddsDraw";
import type { Place, RoundCharge } from "@/types";

export const RevealPanel = (props: {
  reveal: RevealResult;
  place: Place;
  currentYear: number;
  currency: string;
  charges: RoundCharge[];
  onNext: () => void;
  drawCost: number;
  canAffordDraw: boolean;
}) => {
  const { life, results, net, skill, story, lifespan } = props.reveal;
  const [beat, setBeat] = useState(0);

  const beats = revealBeats(results);
  const isFinished = beat >= beats.length - 1;
  const visibleBets = visibleBetCount({ beats, beat });
  const remainingBets = results.length - visibleBets;

  const fees = props.charges.reduce((sum, charge) => sum + charge.amount, 0);
  const roundNet = net - fees;

  function nextLabel() {
    if (isFinished) {
      return `Next human · ${props.drawCost}`;
    }
    if (remainingBets > 0) {
      return `Reveal next bet (${remainingBets} left)`;
    }
    return "See the damage";
  }

  const alive = life.deathYear >= props.currentYear;
  const sexLabel = life.sex === "girl" ? "A girl" : "A boy";
  const fate = alive ? `${sexLabel}, still living` : life.age === 0 ? `${sexLabel}, gone within a year` : `${sexLabel}, dead at ${life.age}`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="flex h-full w-full flex-col">
      <GameCard className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" containerClassName="flex h-full w-full flex-col">
        <h3 className="font-bold text-lg text-white">{fate}</h3>

        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-white/50 text-xs">Born</dt>
            <dd className="font-semibold text-white">
              {fmtYear(life.year)}, {props.place.name}
            </dd>
          </div>
          <div>
            <dt className="text-white/50 text-xs">{alive ? "Projected death" : "Died"}</dt>
            <dd className="font-semibold text-white">{fmtYear(life.deathYear)}</dd>
          </div>
          <div>
            <dt className="text-white/50 text-xs">Cause</dt>
            <dd className="font-semibold text-white">{life.shock ? life.shock.label : "Ordinary life and death"}</dd>
          </div>
        </dl>

        <p className="text-sm text-white/70">{story}</p>

        <div>
          <p className="mb-1 flex gap-3 text-white/50 text-xs">
            <span>Age at death, people born there and then:</span>
            <span className="text-[#5EEAD4]">— Real</span>
            <span className="text-[#F5B83D]">- - Bookie assumed</span>
          </p>
          <LifespanChart histogram={lifespan} deathAge={life.age} />
        </div>

        {results.length === 0 ? (
          <p className="text-white/50 text-sm">No bets this round. Just watching.</p>
        ) : (
          <BetsBreakdown results={results} currency={props.currency} visibleCount={visibleBets} />
        )}

        {isFinished && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2">
            {results.length > 0 && (
              <p className="text-white/50 text-xs">
                Skill {skill >= 0 ? "+" : "−"}
                {Math.abs(Math.round(skill))} pts. Skill is what your bets were worth at the real odds, so a smart bet that lost still
                scores and a lucky one does not.
              </p>
            )}
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/50">Bets</dt>
                <dd className={net >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}>
                  {net >= 0 ? "+" : "−"}
                  {Math.abs(net).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Steps paid for</dt>
                <dd className="text-[#F5B83D]">−{fees.toFixed(2)}</dd>
              </div>
            </dl>
            <p className={`font-bold text-lg ${roundNet >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}>
              {roundNet >= 0 ? "Up" : "Down"} {Math.abs(roundNet).toFixed(2)} {props.currency} this round
            </p>
          </motion.div>
        )}

        <button
          type="button"
          disabled={isFinished && !props.canAffordDraw}
          onClick={() => {
            playClickSound();
            if (isFinished) {
              props.onNext();
            } else {
              setBeat((current) => current + 1);
            }
          }}
          className="accent-gradient rounded-full px-6 py-3 font-bold text-slate-950 disabled:opacity-40"
        >
          {nextLabel()}
        </button>
      </GameCard>
    </motion.div>
  );
};
