import * as z from "zod";
import curvesJson from "@/config/mortal-odds/curves.json";
import erasJson from "@/config/mortal-odds/eras.json";
import marketsJson from "@/config/mortal-odds/markets.json";
import placesJson from "@/config/mortal-odds/places.json";
import type { PricingConfig } from "@/lib/mortal-odds/pricing";
import type { EraFilter, MarketConfig, RegionId } from "@/types";

export const MODES: Record<EraFilter, number> = { all: -Infinity, ce: 1, modern: 1750 };

export const SIMS = 5000;
export const DEATH_WINDOW = 5;
export const PRICING_CONFIG: PricingConfig = { houseEdge: 0.08, maxOdds: 60, minP: 0.003 };

export const REGIONS: Record<RegionId, string> = {
  ssa: "Sub-Saharan Africa",
  mena: "North Africa and the Middle East",
  eur: "Europe",
  sas: "South Asia",
  eas: "East Asia",
  sea: "Southeast Asia and Oceania",
  ame: "the Americas",
};

export const HUMANS_EVER = 117e9;

const regionIdSchema = z.enum(["ssa", "mena", "eur", "sas", "eas", "sea", "ame"]);

const regionSharesSchema = z.object({
  ssa: z.number(),
  mena: z.number(),
  eur: z.number(),
  sas: z.number(),
  eas: z.number(),
  sea: z.number(),
  ame: z.number(),
});

const eraConfigSchema = z.object({
  from: z.number(),
  to: z.number().nullable(),
  births: z.number().positive(),
  skew: z.number().positive(),
  shares: regionSharesSchema,
});

const erasConfigSchema = z.array(eraConfigSchema).min(1);

const placeConfigSchema = z.object({
  name: z.string(),
  continent: z.string(),
  weight: z.number().positive(),
});

const placesConfigSchema = z.record(regionIdSchema, z.array(placeConfigSchema).min(1));

const curvePointsSchema = z.array(z.tuple([z.number(), z.number()])).min(2);

const curvesConfigSchema = z.object({
  worldPop: curvePointsSchema,
  q5: curvePointsSchema,
  adultMean: curvePointsSchema,
  adultSd: curvePointsSchema,
  literacy: curvePointsSchema,
  urban: curvePointsSchema,
});

const marketOptionSchema = z.object({ id: z.string(), label: z.string() });

const marketConfigSchema = z.object({
  id: z.string(),
  kind: z.literal("choice"),
  title: z.string(),
  note: z.string().optional(),
  options: z.array(marketOptionSchema).min(2),
  fixedBookieP: z.record(z.string(), z.number()).optional(),
});

const marketsConfigSchema = z.array(marketConfigSchema).min(1);

export type EraConfig = z.infer<typeof eraConfigSchema>;
export type PlaceConfig = z.infer<typeof placeConfigSchema>;

export const erasConfig: EraConfig[] = erasConfigSchema.parse(erasJson);
export const placesConfig: Record<RegionId, PlaceConfig[]> = placesConfigSchema.parse(placesJson);
export const marketsConfig: MarketConfig[] = marketsConfigSchema.parse(marketsJson);

const curves = curvesConfigSchema.parse(curvesJson);
export const worldPopCurve: ReadonlyArray<readonly [number, number]> = curves.worldPop;
export const bookieCurves = {
  q5: curves.q5,
  adultMean: curves.adultMean,
  adultSd: curves.adultSd,
  literacy: curves.literacy,
  urban: curves.urban,
};
