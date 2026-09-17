import React from "react";

export type LinkTask = {
  title: string;
  completed: boolean;
  reward: number;
  link: string;
};

export type QuestList = {
  title: string;
  desc: string;
  tasks: LinkTask[];
  id: string;
  claimed: boolean;
};


export type UserTask = {
  id:number,
  title: string;
  link: string;
  reward:number;
  completed:boolean
}

// =====================================
// ⬢  Mortal Odds
// =====================================
export type RegionId = "ssa" | "mena" | "eur" | "sas" | "eas" | "sea" | "ame";
export type EraFilter = "all" | "ce" | "modern";

export type Place = { name: string; continent: string; share: number };
export type Draw = { year: number; region: RegionId; place: Place };
export type PlaceContext = { where: string; local: string; when: string };

export type MarketOption = { id: string; label: string };
export type MarketConfig = {
  id: string;
  kind: "choice";
  title: string;
  note?: string;
  options: MarketOption[];
  fixedBookieP?: Record<string, number>;
};

export type ChanceTag = "Likely" | "Toss-up" | "Unlikely" | "Long shot";
export type Price = { p: number; odds: number | null; tag: ChanceTag };
export type MarketPrices = Record<string, Record<string, Price>>;

export type Bet =
  | { marketId: string; kind: "choice"; optionId: string; stake: number }
  | { marketId: "dy"; kind: "range"; guessYear: number; stake: number };