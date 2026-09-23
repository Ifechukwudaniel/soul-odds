import * as z from "zod";
import curvesJson from "@/config/mortal-odds/curves.json";
import erasJson from "@/config/mortal-odds/eras.json";
import jobsJson from "@/config/mortal-odds/jobs.json";
import marketsJson from "@/config/mortal-odds/markets.json";
import placesJson from "@/config/mortal-odds/places.json";
import regionModifiersJson from "@/config/mortal-odds/region-modifiers.json";
import shocksJson from "@/config/mortal-odds/shocks.json";
import sinsJson from "@/config/mortal-odds/sins.json";
import worldLandJson from "@/config/mortal-odds/world-land.json";
import type { PricingConfig } from "@/lib/mortal-odds/pricing";
import type { EraFilter, MarketConfig, MarketOption, RegionId } from "@/types";

export const MODES: Record<EraFilter, number> = { all: -Infinity, ce: 1, modern: 1750 };

/** Chip sizes the player can lock in as their stake before summoning a soul. */
export const CHIP_SIZES = [1, 5, 10, 25, 50];

/** Flat fee to reroll the age/land once a stake is already locked in; the first reveal is free. */
export const REDRAW_COST = 5;

export const SIMS = 5000;
export const DEATH_WINDOW = 5;
/** How many sins from the catalog are offered as bettable options each round (plus "Clean"). Matches the age market's option count. */
export const SINS_PER_ROUND = 3;
export const PRICING_CONFIG: PricingConfig = { houseEdge: 0.08, maxOdds: 60, minP: 0.003 };
export const SEX_BOY_SHARE = 0.512;

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

/** Every region id, typed — avoids casting the result of Object.keys over region-keyed records. */
export const REGION_IDS = regionIdSchema.options;

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
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
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

/** Land outlines as bare [lon, lat] rings — Natural Earth 110m, stripped of GeoJSON envelope and rounded to 0.1°. */
const worldLandSchema = z.array(z.array(z.tuple([z.number(), z.number()])).min(4)).min(1);

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

const shockRateSchema = z.object({
  ssa: z.number().optional(),
  mena: z.number().optional(),
  eur: z.number().optional(),
  sas: z.number().optional(),
  eas: z.number().optional(),
  sea: z.number().optional(),
  ame: z.number().optional(),
  all: z.number().optional(),
});

const shockConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  phrase: z.string(),
  from: z.number(),
  to: z.number(),
  rate: shockRateSchema,
  sexMultiplier: z.object({ girl: z.number().optional(), boy: z.number().optional() }).optional(),
  ages: z.tuple([z.number(), z.number()]).optional(),
});

const shocksConfigSchema = z.array(shockConfigSchema);

/**
 * The four crime categories the deployed SoulOddsEngine title actually predicts on-chain
 * (index-aligned with the title's `crimes` slots — see `config/mortal-odds/soul-odds-title.json`).
 * Adding, removing or reweighting a `sins.json` entry never touches this list or the contract;
 * only changing the categories themselves would require a new title deployment.
 */
export const SIN_CATEGORIES = [
  { id: "violence", label: "Violence" },
  { id: "deceit", label: "Deceit" },
  { id: "greed", label: "Greed" },
  { id: "heresy", label: "Heresy" },
] as const;
export type SinCategoryId = (typeof SIN_CATEGORIES)[number]["id"];

/** Joins the categories of a multi-sin pick into one option id, e.g. "violence+greed". */
export const SIN_ID_SEPARATOR = "+";

/**
 * The bettable sin catalog. Hand-edited: add an entry here and it becomes a possible outcome
 * for every life whose crime category matches, no other file to touch. `to: null` means the sin
 * is still possible today; `rate` follows the same region-or-"all" shape as a shock's rate.
 * `category` is flavor-only bucketing into one of the four on-chain `SIN_CATEGORIES` slots.
 */
const sinConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  phrase: z.string(),
  from: z.number(),
  to: z.number().nullable(),
  rate: shockRateSchema,
  category: z.enum(SIN_CATEGORIES.map((category) => category.id) as [SinCategoryId, ...SinCategoryId[]]),
});

const sinsConfigSchema = z.array(sinConfigSchema).min(1);

const jobPoolSchema = z.object({ land: z.array(z.string()), city: z.array(z.string()), lit: z.array(z.string()) });
const jobsConfigSchema = z.object({
  forager: jobPoolSchema,
  premodern: jobPoolSchema,
  industrial: jobPoolSchema,
  modern: jobPoolSchema,
});

const regionModPairSchema = z.tuple([z.number(), z.number()]);
const regionModPairsSchema = z.object({
  ssa: regionModPairSchema,
  mena: regionModPairSchema,
  eur: regionModPairSchema,
  sas: regionModPairSchema,
  eas: regionModPairSchema,
  sea: regionModPairSchema,
  ame: regionModPairSchema,
});

const sexPairSchema = z.object({ girl: z.number(), boy: z.number() });

const regionModifiersConfigSchema = z.object({
  regionMods: z.object({ industrial: regionModPairsSchema, modern: regionModPairsSchema }),
  literacyMultiplier: z.object({ ancient: regionSharesSchema, early: regionSharesSchema, modern: regionSharesSchema }),
  sexLiteracyMultiplier: z.object({ old: sexPairSchema, new: sexPairSchema }),
  cityMultiplier: z.object({ old: regionSharesSchema, new: regionSharesSchema }),
  sexChildMortalityMultiplier: sexPairSchema,
});

export type EraConfig = z.infer<typeof eraConfigSchema>;
export type PlaceConfig = z.infer<typeof placeConfigSchema>;
export type LandRing = z.infer<typeof worldLandSchema>[number];
export type ShockConfig = z.infer<typeof shockConfigSchema>;
export type SinConfig = z.infer<typeof sinConfigSchema>;
export type JobsConfig = z.infer<typeof jobsConfigSchema>;
export type RegionModifiersConfig = z.infer<typeof regionModifiersConfigSchema>;

export const worldLand: LandRing[] = worldLandSchema.parse(worldLandJson);
export const erasConfig: EraConfig[] = erasConfigSchema.parse(erasJson);
export const placesConfig: Record<RegionId, PlaceConfig[]> = placesConfigSchema.parse(placesJson);
export const shocksConfig: ShockConfig[] = shocksConfigSchema.parse(shocksJson);
export const sinsConfig: SinConfig[] = sinsConfigSchema.parse(sinsJson);
export const jobsConfig: JobsConfig = jobsConfigSchema.parse(jobsJson);
export const regionModifiersConfig: RegionModifiersConfig = regionModifiersConfigSchema.parse(regionModifiersJson);

/**
 * The "sins" market's options mirror every crime state the contract accepts: "Clean" for none,
 * each of the four crime categories on its own, and every pair of two (the contract allows at
 * most two, and only an exact match pays). The specific sin revealed within a category (drawn
 * from `sins.json`) is flavor only — see `pickSin`.
 */
const sinPairOptions = SIN_CATEGORIES.flatMap((first, index) =>
  SIN_CATEGORIES.slice(index + 1).map(
    (second): MarketOption => ({ id: `${first.id}${SIN_ID_SEPARATOR}${second.id}`, label: `${first.label} + ${second.label}` }),
  ),
);

const sinsMarket: MarketConfig = {
  id: "sins",
  kind: "choice",
  title: "The Weighing of the Heart",
  note: "Anubis weighs every heart against Ma'at's feather before he lets a soul pass.",
  options: [
    { id: "none", label: "Clean" },
    ...SIN_CATEGORIES.map((category): MarketOption => ({ id: category.id, label: category.label })),
    ...sinPairOptions,
  ],
};

export const marketsConfig: MarketConfig[] = [...marketsConfigSchema.parse(marketsJson), sinsMarket];

const curves = curvesConfigSchema.parse(curvesJson);
export const worldPopCurve: ReadonlyArray<readonly [number, number]> = curves.worldPop;
export const bookieCurves = {
  q5: curves.q5,
  adultMean: curves.adultMean,
  adultSd: curves.adultSd,
  literacy: curves.literacy,
  urban: curves.urban,
};
