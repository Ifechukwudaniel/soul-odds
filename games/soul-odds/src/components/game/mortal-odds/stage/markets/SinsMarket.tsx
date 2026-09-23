"use client";

import { useState } from "react";
import { GiFeather } from "react-icons/gi";
import { LuLoader } from "react-icons/lu";
import { BookieOdds } from "@/components/game/mortal-odds/stage/markets/BookieOdds";
import { SIN_CATEGORIES } from "@/lib/mortal-odds/config";
import { narrativeFor } from "@/lib/mortal-odds/sin-narrative-helpers";
import { categoriesOfSinOption, MAX_SINS, sinOptionId } from "@/lib/mortal-odds/sin-selection";
import { playClickSound } from "@/utils/playClickSound";
import type { SinNarratives } from "@/lib/mortal-odds/sin-variants";
import type { SinCategoryId } from "@/lib/mortal-odds/config";
import type { MarketConfig, Price } from "@/types";

/**
 * Anubis only weighs a heart against Ma'at's feather when it might carry something — so the sin
 * category picker only appears once the heart is judged heavy. A clean heart settles the bet
 * outright at "none", the same as any other choice market.
 */
export const SinsMarket = (props: {
  market: MarketConfig;
  prices: Record<string, Price>;
  narratives: SinNarratives | null;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
}) => {
  const [heartIsHeavy, setHeartIsHeavy] = useState(
    props.selectedOptionId !== undefined && props.selectedOptionId !== "none",
  );
  const selectedOdds = props.selectedOptionId ? props.prices[props.selectedOptionId]?.odds : undefined;
  const selectedSins = props.selectedOptionId ? categoriesOfSinOption(props.selectedOptionId) : [];
  const atSinLimit = selectedSins.length >= MAX_SINS;

  // The contract settles the exact set of sins (one or two), so a pick is a set: tap to add or release, never empty here.
  const toggleSin = (id: SinCategoryId) => {
    const next = selectedSins.includes(id) ? selectedSins.filter((sin) => sin !== id) : [...selectedSins, id];
    if (next.length === 0 || next.length > MAX_SINS) return;
    playClickSound();
    props.onSelect(sinOptionId(next));
  };

  if (!heartIsHeavy) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
        <div className="flex flex-col items-center gap-1">
          <GiFeather size={32} className="text-[#3FB6A8]" />
          <h3 className="font-bold text-white text-xl">The Weighing of the Heart</h3>
          <p className="max-w-xs text-white/40 text-xs">
            Anubis sets the heart on the scale against Ma'at's feather. Does it balance, or sink under a sin's weight?
          </p>
          <BookieOdds odds={selectedOdds} />
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
            <span className="mt-1 block text-xs opacity-70">name the sins</span>
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
        <p className="max-w-xs text-white/40 text-xs">
          Anubis has seen every sin recorded. Name every sin that weighed on this heart — one or two. Only an exact match pays.
        </p>
        <BookieOdds odds={props.selectedOptionId === "none" ? undefined : selectedOdds} />
      </div>

      {props.narratives ? (
        <div className="grid w-full max-w-xl grid-cols-2 gap-3">
          {SIN_CATEGORIES.map((category) => {
            const isSelected = selectedSins.includes(category.id);
            const phrase = narrativeFor(props.narratives, category.id)?.phrase ?? category.label;
            return (
              <button
                type="button"
                key={category.id}
                disabled={!isSelected && atSinLimit}
                aria-pressed={isSelected}
                onClick={() => toggleSin(category.id)}
                className={`rounded-lg border px-4 py-4 font-semibold text-sm leading-snug disabled:opacity-40 ${
                  isSelected
                    ? "accent-gradient border-black text-slate-950 shadow-[inset_1px_1px_1.5px_0px_#FFFFFF66]"
                    : "border-black bg-[#262433] text-[#AFAFAF]"
                }`}
              >
                {phrase}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6" role="status">
          <LuLoader size={24} className="animate-spin text-[#3FB6A8]" />
          <p className="animate-pulse text-white/50 text-xs">Consulting the record of sins…</p>
        </div>
      )}

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
