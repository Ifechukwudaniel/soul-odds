import { describe, expect, it } from "vitest";
import { erasConfig } from "@/lib/mortal-odds/config";
import { eraFor } from "@/lib/mortal-odds/geo";
import { deriveRoundData } from "@/lib/mortal-odds/round-data";
import type { Draw } from "@/types";

const DRAW: Draw = {
  year: 1850,
  region: "eur",
  place: { name: "Lyon, Europe", share: 0.1, lat: 45.7, lon: 4.8 },
};
const ERA = eraFor({ year: DRAW.year, erasConfig });
const WAGER = 10n * 10n ** 18n;

const derive = (samplesSeed: number, story = "A story.") =>
  deriveRoundData({ draw: DRAW, era: ERA, wagerWei: WAGER, samplesSeed, story, currentYear: 2026 });

describe("deriveRoundData", () => {
  it("rebuilds identical samples, prices and guess from the same seed", () => {
    expect(derive(42)).toEqual(derive(42));
  });

  it("draws different samples from a different seed", () => {
    expect(derive(1).samples).not.toEqual(derive(2).samples);
  });

  it("prices the chain markets from the wager alone, whatever the seed", () => {
    expect(derive(1).prices).toEqual(derive(2).prices);
  });

  it("carries the stored story into the place context", () => {
    expect(derive(1, "Kept as is.").context.story).toBe("Kept as is.");
    expect(derive(1).context.where).toBe("Lyon, Europe");
  });
});
