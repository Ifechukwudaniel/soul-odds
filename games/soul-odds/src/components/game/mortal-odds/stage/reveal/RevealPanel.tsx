"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";
import { GameButton } from "@/components/game/GameButton";
import { GameCard } from "@/components/game/home/GameCard";
import { BetResultStamp } from "@/components/game/mortal-odds/stage/reveal/BetResultStamp";
import { BetsBreakdown } from "@/components/game/mortal-odds/stage/reveal/BetsBreakdown";
import { LifespanChart } from "@/components/game/mortal-odds/stage/reveal/LifespanChart";
import { RevealStamp } from "@/components/game/mortal-odds/stage/reveal/RevealStamp";
import { fmtYear } from "@/lib/mortal-odds/format";
import { serifFont } from "@/styles/serif-font";
import { playClickSound } from "@/utils/playClickSound";
import type { RevealResult } from "@/hooks/useMortalOddsDraw";
import type { Place, RoundCharge } from "@/types";

const STAMP_DELAY_MS = 1500;

const FactCard = (props: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/10 bg-[#000000]/30 px-3 py-2 text-left">
    <p className="text-[10px] text-white/40 uppercase tracking-[0.15em]">{props.label}</p>
    <p className="font-semibold text-sm text-white">{props.value}</p>
  </div>
);

export const RevealPanel = (props: { reveal: RevealResult; place: Place; currentYear: number; currency: string; charges: RoundCharge[]; onNext: () => void; drawCost: number; canAffordDraw: boolean }) => {
  const { life, results, net, skill, story, lifespan, realMedianAge, bookieMedianAge } = props.reveal;
  const [stampReady, setStampReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStampReady(true), STAMP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    playClickSound();
    setDismissed(true);
  };

  // The stake is already reflected inside net; only side fees (redraws) reduce the round's take further.
  const fees = props.charges.filter((charge) => charge.kind === "fee").reduce((sum, charge) => sum + charge.amount, 0);
  const roundNet = net - fees;

  const alive = life.deathYear >= props.currentYear;
  const sexLabel = life.sex === "girl" ? "A girl" : "A boy";
  const fate = alive ? `${sexLabel}, still living` : life.age === 0 ? `${sexLabel}, gone within a year` : `${sexLabel}, dead at ${life.age}`;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="flex h-full w-full flex-col">
      <GameCard className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" containerClassName="flex h-full w-full flex-col">
        <h3 className={`${serifFont.className} font-bold text-2xl text-white`}>{fate}</h3>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          <FactCard label="Born" value={`${fmtYear(life.year)}, ${props.place.name}`} />
          <FactCard label={alive ? "Projected death" : "Died"} value={fmtYear(life.deathYear)} />
          <FactCard label="Cause" value={life.shock ? life.shock.label : "Ordinary life and death"} />
          <FactCard label="Literate" value={life.literate ? "Yes" : "No"} />
          <FactCard label="Lived in a city" value={life.city ? "Yes" : "No"} />
          <FactCard label="Sin" value={life.sin ? life.sin.label : "Clean"} />
        </div>

        <p className={`${serifFont.className} text-base text-white/80 leading-relaxed`}>{story}</p>

        <div>
          <p className="mb-1 flex flex-wrap gap-x-3 gap-y-1 text-white/50 text-xs">
            <span className="text-[#3FB6A8]">■ Real spread</span>
            <span className="text-[#F5B83D]">- - Bookie assumed</span>
            <span className="text-[#F5B83D]">○ Bookie's typical age</span>
            <span className="text-[#4C6FD1]">● Real typical age</span>
          </p>
          <LifespanChart histogram={lifespan} deathAge={life.age} realMedianAge={realMedianAge} bookieMedianAge={bookieMedianAge} />
        </div>

        {results.length === 0 && <p className="text-white/50 text-sm">No bets this round. Just watching.</p>}

        {dismissed && results.length > 0 && <BetsBreakdown results={results} currency={props.currency} visibleCount={results.length} />}

        {dismissed && results.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <RevealStamp tone="neutral" rotate={-2}>
              Skill {skill >= 0 ? "+" : "−"}
              {Math.abs(Math.round(skill))} pts
            </RevealStamp>
            <p className="text-white/50 text-xs">
              What your bets were worth at the real odds, so a smart bet that lost still scores and a lucky one does not.
            </p>
          </div>
        )}

        {dismissed && (
          <div className="flex flex-col gap-2">
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/50">Bets</dt>
                <dd className={net >= 0 ? "text-[#6BA84F]" : "text-[#B7410E]"}>
                  {net >= 0 ? "+" : "−"}
                  {Math.abs(net).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Paid to the scribe</dt>
                <dd className="text-[#F5B83D]">−{fees.toFixed(2)}</dd>
              </div>
            </dl>
            <div className="flex items-center gap-2">
              <RevealStamp tone={roundNet >= 0 ? "win" : "loss"} rotate={-3} className="text-sm">
                {roundNet >= 0 ? "Up" : "Down"}
              </RevealStamp>
              <p className={`font-bold text-lg ${roundNet >= 0 ? "text-[#6BA84F]" : "text-[#B7410E]"}`}>
                {Math.abs(roundNet).toFixed(2)} {props.currency} this round
              </p>
            </div>
          </div>
        )}

        {dismissed && (
          <GameButton variant="papyrus" disabled={!props.canAffordDraw} onClick={props.onNext} className="px-6 py-3 text-base">
            Summon another soul
            <span className="flex items-center gap-1 text-slate-950/60">
              <span className="h-3 w-px bg-slate-950/20" />
              <CurrencyCoinIcon width={16} height="16" />
              {props.drawCost}
            </span>
          </GameButton>
        )}
      </GameCard>

      <AnimatePresence>
        {stampReady && !dismissed && (
          <BetResultStamp results={results} skill={skill} roundNet={roundNet} currency={props.currency} onDismiss={handleDismiss} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
