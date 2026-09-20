"use client";

import { useState } from "react";
import { GiFeather } from "react-icons/gi";
import { playClickSound } from "@/utils/playClickSound";
import type { MarketConfig, Price } from "@/types";

function oddsLabel(price: Price | undefined): string {
  return price?.odds === null || price?.odds === undefined ? "—" : `${price.odds.toFixed(2)}x`;
}

/**
 * Anubis only weighs a heart against Ma'at's feather when it might carry something — so the sin
 * category picker only appears once the heart is judged heavy. A clean heart settles the bet
 * outright at "none", the same as any other choice market.
 */
export const SinsMarket = (props: {
  market: MarketConfig;
  prices: Record<string, Price>;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
}) => {
  const [heartIsHeavy, setHeartIsHeavy] = useState(
    props.selectedOptionId !== undefined && props.selectedOptionId !== "none",
  );
  const categories = props.market.options.filter((option) => option.id !== "none" && option.id in props.prices);

  if (!heartIsHeavy) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
        <div className="flex flex-col items-center gap-1">
          <GiFeather size={32} className="text-[#3FB6A8]" />
          <h3 className="font-bold text-white text-xl">The Weighing of the Heart</h3>
          <p className="max-w-xs text-white/40 text-xs">
            Anubis sets the heart on the scale against Ma'at's feather. Does it balance, or sink under a sin's weight?
          </p>
        </div>

        <div className="grid w-full max-w-xl grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={props.selectedOptionId === "none"}
            onClick={() => {
              playClickSound();
              props.onSelect("none");
            }}
            className={`rounded-lg border px-4 py-4 font-semibold text-base ${
              props.selectedOptionId === "none"
                ? "accent-gradient border-black text-slate-950 shadow-[inset_1px_1px_1.5px_0px_#FFFFFF66]"
                : "border-black bg-[#262433] text-[#AFAFAF]"
            }`}
          >
            The heart balances
            <span className="mt-1 block text-xs opacity-70">{oddsLabel(props.prices.none)}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setHeartIsHeavy(true);
            }}
            className="rounded-lg border border-black bg-[#262433] px-4 py-4 font-semibold text-base text-[#AFAFAF]"
          >
            The heart is heavy
            <span className="mt-1 block text-xs opacity-70">name the sin</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <div className="flex flex-col items-center gap-1">
        <GiFeather size={32} className="text-[#3FB6A8]" />
        <h3 className="font-bold text-white text-xl">Which sin tipped the scale?</h3>
        <p className="max-w-xs text-white/40 text-xs">Anubis has seen every sin recorded. Name the one that weighed on this heart.</p>
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {categories.map((option) => {
          const price = props.prices[option.id];
          const isSelected = props.selectedOptionId === option.id;
          return (
            <button
              type="button"
              key={option.id}
              disabled={!price || price.odds === null}
              aria-pressed={isSelected}
              onClick={() => {
                playClickSound();
                props.onSelect(option.id);
              }}
              className={`rounded-lg border px-4 py-4 font-semibold text-base disabled:opacity-40 ${
                isSelected
                  ? "accent-gradient border-black text-slate-950 shadow-[inset_1px_1px_1.5px_0px_#FFFFFF66]"
                  : "border-black bg-[#262433] text-[#AFAFAF]"
              }`}
            >
              {option.label}
              <span className="mt-1 block text-xs opacity-70">{oddsLabel(price)}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="text-white/40 text-xs underline"
        onClick={() => {
          playClickSound();
          setHeartIsHeavy(false);
          props.onSelect("none");
        }}
      >
        ← the heart balances after all
      </button>
    </div>
  );
};
