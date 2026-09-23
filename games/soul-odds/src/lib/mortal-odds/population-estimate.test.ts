import { describe, expect, it } from "vitest";
import { describePopulation, estimatePopulation, estimatesAt } from "@/lib/mortal-odds/population-estimate";

describe("estimatePopulation", () => {
  it("returns the researched figure for a polity in a year it has one", () => {
    const estimate = estimatePopulation({ empire: "Roman Empire", year: 100 });
    expect(estimate?.method).toMatch(/^seshat/);
    expect(estimate?.population).toBeGreaterThan(40_000_000);
    expect(estimate?.population).toBeLessThan(80_000_000);
  });

  it("matches names case-insensitively", () => {
    expect(estimatePopulation({ empire: "roman empire", year: 100 })?.empire).toBe("Roman Empire");
  });

  it("falls back to a name that contains the query", () => {
    expect(estimatePopulation({ empire: "Achaemenid", year: -500 })?.empire).toBe("Achaemenid Empire");
  });

  it("finds a polity by its Wikidata id", () => {
    const byName = estimatePopulation({ empire: "Roman Empire", year: 100 });
    expect(estimatePopulation({ wikidata: byName?.wikidata ?? "", year: 100 })?.empire).toBe("Roman Empire");
  });

  it("keeps a low and high estimate around the figure", () => {
    const estimate = estimatePopulation({ empire: "Northern Song", year: 1000 });
    expect(estimate?.low).toBeLessThanOrEqual(estimate?.population ?? 0);
    expect(estimate?.high).toBeGreaterThanOrEqual(estimate?.population ?? 0);
  });

  it("returns null for an unknown empire or a year it did not exist", () => {
    expect(estimatePopulation({ empire: "Atlantis", year: 100 })).toBeNull();
    expect(estimatePopulation({ empire: "Roman Empire", year: 1800 })).toBeNull();
  });
});

describe("estimatesAt", () => {
  it("lists polities alive that year, most populous first, without duplicate rows", () => {
    const polities = estimatesAt(100);
    expect(polities.length).toBeGreaterThan(10);
    expect(polities.every((polity) => polity.fromYear <= 100 && 100 <= polity.toYear)).toBe(true);
    expect(polities.some((polity) => polity.empire.startsWith("("))).toBe(false);
    expect(polities[0]!.population).toBeGreaterThanOrEqual(polities[1]!.population);
  });
});

describe("describePopulation", () => {
  it("says how many people lived in an empire at that time", () => {
    expect(describePopulation({ empire: "Roman Empire", year: 100 })).toMatch(/^Roman Empire, 100 CE: about \d+ million people lived here\.$/);
  });

  it("returns null when the empire did not exist then", () => {
    expect(describePopulation({ empire: "Roman Empire", year: 1800 })).toBeNull();
  });
});
