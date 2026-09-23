import { describe, expect, it } from "vitest";
import { pickCauseOfDeath } from "@/lib/mortal-odds/cause-of-death";
import { createRng } from "@/lib/mortal-odds/rng";
import type { Life } from "@/types";

const CURRENT_YEAR = 2026;

const life = (overrides: Partial<Life> = {}): Life => ({
  year: 1500,
  region: "eur",
  sex: "boy",
  age: 40,
  deathYear: 1540,
  shock: null,
  literate: false,
  city: false,
  sin: null,
  ...overrides,
});

const causesOver = (subject: Life) =>
  new Set(Array.from({ length: 300 }, (_, seed) => pickCauseOfDeath({ life: subject, currentYear: CURRENT_YEAR, rng: createRng(seed) })));

describe("pickCauseOfDeath", () => {
  it("returns null while the soul is still living", () => {
    expect(pickCauseOfDeath({ life: life({ year: 2000, age: 40, deathYear: 2040 }), currentYear: CURRENT_YEAR, rng: createRng(1) })).toBeNull();
  });

  it("returns null when a shock killed the soul", () => {
    const shock = { id: "black-death", label: "Black Death", phrase: "the Black Death", from: 1346, to: 1353 };
    expect(pickCauseOfDeath({ life: life({ shock }), currentYear: CURRENT_YEAR, rng: createRng(1) })).toBeNull();
  });

  it("keeps modern causes out of a medieval life", () => {
    const causes = causesOver(life());
    expect(causes).not.toContain("A road accident");
    expect(causes).not.toContain("Cancer");
    expect(causes).not.toContain("An overdose");
  });

  it("keeps childbirth to women of childbearing age", () => {
    expect(causesOver(life())).not.toContain("Childbirth");
    expect(causesOver(life({ sex: "girl" }))).toContain("Childbirth");
    expect(causesOver(life({ sex: "girl", age: 70, deathYear: 1570 }))).not.toContain("Childbirth");
  });

  it("gives an infant a cause fit for an infant", () => {
    const causes = causesOver(life({ age: 0, deathYear: 1500 }));
    expect(causes).not.toContain("Old age");
    expect(causes).not.toContain("Heart failure");
  });

  describe("with a sin on record", () => {
    const sin = { id: "greed", label: "Grave Robbery", phrase: "stole from a tomb", from: 0, to: null };

    it("offers shameful deaths that name the sin", () => {
      expect(causesOver(life({ sin }))).toContain("Hanged before a jeering crowd for grave robbery");
    });

    it("never offers shameful deaths to a clean soul", () => {
      const causes = [...causesOver(life())];
      expect(causes.filter((cause) => cause?.includes("for grave robbery") || cause?.startsWith("Died in disgrace"))).toEqual([]);
    });

    it("keeps prison executions out of a medieval life", () => {
      expect(causesOver(life({ sin }))).not.toContain("Executed in prison for grave robbery");
    });
  });
});
