"use client";

import { useState } from "react";
import { ChoiceMarket } from "@/components/game/mortal-odds/stage/markets/ChoiceMarket";
import { RangeMarket } from "@/components/game/mortal-odds/stage/markets/RangeMarket";
import { marketsConfig } from "@/lib/mortal-odds/config";
import { playClickSound } from "@/utils/playClickSound";
import type { Bet, Draw, MarketPrices, Price } from "@/types";

const STEPS: readonly string[] = [...marketsConfig.map((market) => market.id), "dy"];

function findMarket(marketId: string) {
  const market = marketsConfig.find((m) => m.id === marketId);
  if (!market) throw new Error(`Unknown market "${marketId}"`);
  return market;
}

export const MarketPager = (props: {
  draw: Draw;
  prices: MarketPrices;
  priceDeathYear: (guessYear: number) => Price;
  defaultDeathGuess: number;
  chipSize: number;
  bets: Record<string, Bet>;
  onSetChoice: (marketId: string, optionId: string, stake: number) => void;
  onSetDeathYear: (guessYear: number, stake: number) => void;
  onRemoveBet: (marketId: string) => void;
}) => {
  const [step, setStep] = useState(0);
  const [deathGuess, setDeathGuess] = useState(props.defaultDeathGuess);
  const stepId = STEPS[step] ?? "sex";
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-3">
      {stepId === "dy" ? (
        <RangeMarket
          fromYear={props.draw.year}
          guessYear={deathGuess}
          onGuessChange={setDeathGuess}
          price={props.priceDeathYear(deathGuess)}
          isOnSlip={Boolean(props.bets.dy)}
          chipSize={props.chipSize}
          onToggle={() => {
            if (props.bets.dy) props.onRemoveBet("dy");
            else props.onSetDeathYear(deathGuess, props.chipSize);
          }}
        />
      ) : (
        <ChoiceMarket
          market={findMarket(stepId)}
          prices={props.prices[stepId] ?? {}}
          selectedOptionId={props.bets[stepId]?.kind === "choice" ? props.bets[stepId].optionId : undefined}
          chipSize={props.chipSize}
          onSelect={(optionId) => props.onSetChoice(stepId, optionId, props.chipSize)}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => {
            playClickSound();
            setStep((s) => s - 1);
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 disabled:opacity-30"
        >
          Back
        </button>

        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((id, i) => (
            <span
              key={id}
              className={`h-1.5 w-1.5 rounded-full ${props.bets[id] ? "bg-[#9181F0]" : "bg-white/20"} ${
                i === step ? "ring-2 ring-white/30" : ""
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={isLast}
          onClick={() => {
            playClickSound();
            setStep((s) => s + 1);
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
};
