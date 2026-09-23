import { describe, expect, it } from "vitest";
import { estimatePopulation, estimatesAt } from "@/lib/mortal-odds/population-estimate";

describe("estimatePopulation", () => {
  it("returns the researched figure for a polity in a year it has one", () => {
    const estimate = estimatePopulation({ empire: "Roman Empire", year: 100 });
    expect(estimate?.method).toBe("seshat");
    expect(estimate?.population).toBe(55_000_000);
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
