"use client";

import { useState } from "react";
import { GameCard } from "@/components/game/home/GameCard";
import { StageSlide } from "@/components/game/mortal-odds/stage/StageSlide";
import { ChoiceMarket } from "@/components/game/mortal-odds/stage/markets/ChoiceMarket";
import { marketsConfig } from "@/lib/mortal-odds/config";
import { playClickSound } from "@/utils/playClickSound";
import type { Bet, MarketPrices } from "@/types";

const LAST_STEP = marketsConfig.length - 1;

export const PredictionsPanel = (props: {
  chipSize: number;
  prices: MarketPrices;
  bets: Record<string, Bet>;
  onSetChoice: (marketId: string, optionId: string, stake: number) => void;
  onBack: () => void;
}) => {
  const [slide, setSlide] = useState({ step: 0, direction: 0 });
  const { step, direction } = slide;

  const market = marketsConfig[step];
  const bet = market ? props.bets[market.id] : undefined;

  const goTo = (next: number) => {
    if (next < 0 || next > LAST_STEP) {
      return;
    }
    setSlide({ step: next, direction: next > step ? 1 : -1 });
  };

  return (
    <GameCard
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
      containerClassName="flex h-full w-full flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-0 flex-1 flex-col gap-3">
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

          <StageSlide slideKey={step} direction={direction} onSwipe={(delta) => goTo(step + delta)}>
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
          </StageSlide>

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
                  className={`h-1.5 w-1.5 rounded-full ${props.bets[entry.id] ? "bg-[#F5B83D]" : "bg-white/20"} ${
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
        </div>
      </div>
    </GameCard>
  );
};
