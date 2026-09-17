"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { GameCard } from "@/components/game/home/GameCard";
import { PlaceBetButton } from "@/components/game/home/PlaceBetButton";
import { ChoiceMarket } from "@/components/game/mortal-odds/stage/markets/ChoiceMarket";
import { marketsConfig } from "@/lib/mortal-odds/config";
import { playClickSound } from "@/utils/playClickSound";
import type { Bet, MarketPrices } from "@/types";

const LAST_STEP = marketsConfig.length - 1;
const SWIPE_THRESHOLD = 60;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

export const PredictionsPanel = (props: {
  chipSize: number;
  prices: MarketPrices;
  bets: Record<string, Bet>;
  onSetChoice: (marketId: string, optionId: string, stake: number) => void;
  onBack: () => void;
  onPlaceBet: () => void;
}) => {
  const [[step, direction], setSlide] = useState<[number, number]>([0, 0]);

  const hasBets = Object.keys(props.bets).length > 0;
  const market = marketsConfig[step];
  const bet = market ? props.bets[market.id] : undefined;

  const goTo = (next: number) => {
    if (next < 0 || next > LAST_STEP) return;
    setSlide([next, next > step ? 1 : -1]);
  };

  return (
    <GameCard
      className="flex min-h-0 flex-1 flex-col gap-3"
      containerClassName="flex w-full max-h-[calc(100dvh-14rem)] flex-col"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            props.onBack();
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:text-white"
        >
          ← Back
        </button>
        <span className="text-white/40 text-xs">
          {step + 1} of {marketsConfig.length}
        </span>
      </div>

      <div className="relative min-h-64 flex-1 overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) goTo(step + 1);
              if (info.offset.x > SWIPE_THRESHOLD) goTo(step - 1);
            }}
            className="absolute inset-0 overflow-y-auto px-1"
          >
            {market && (
              <ChoiceMarket
                market={market}
                prices={props.prices[market.id] ?? {}}
                selectedOptionId={bet?.kind === "choice" ? bet.optionId : undefined}
                onSelect={(optionId) => {
                  props.onSetChoice(market.id, optionId, props.chipSize);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => {
            playClickSound();
            goTo(step - 1);
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 disabled:opacity-30"
        >
          ‹
        </button>

        <div className="flex gap-1.5">
          {marketsConfig.map((entry, index) => (
            <button
              type="button"
              key={entry.id}
              aria-label={`Go to ${entry.title}`}
              onClick={() => {
                playClickSound();
                goTo(index);
              }}
              className={`h-1.5 w-1.5 rounded-full ${props.bets[entry.id] ? "bg-[#9181F0]" : "bg-white/20"} ${
                index === step ? "ring-2 ring-white/30" : ""
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={step === LAST_STEP}
          onClick={() => {
            playClickSound();
            goTo(step + 1);
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {step === LAST_STEP && <PlaceBetButton label="Place Bet" disabled={!hasBets} onClick={props.onPlaceBet} />}
    </GameCard>
  );
};
