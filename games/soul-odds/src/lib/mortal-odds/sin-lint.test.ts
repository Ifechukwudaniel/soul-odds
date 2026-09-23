import { describe, expect, it } from "vitest";
import { findSinAnachronisms } from "@/lib/mortal-odds/sin-lint";
import type { SinNarratives } from "@/lib/mortal-odds/openrouter";

const narratives = (phrase: string): SinNarratives => {
  const entry = { label: "Wrongdoing", phrase };
  return { violence: entry, deceit: entry, greed: entry, heresy: entry };
};

describe("findSinAnachronisms", () => {
  it("flags things that did not exist yet in the year", () => {
    expect(findSinAnachronisms({ narratives: narratives("Stole the pharaoh's coins"), year: -3500 })).toEqual(["pharaoh", "coins"]);
  });

  it("allows the same words once they existed", () => {
    expect(findSinAnachronisms({ narratives: narratives("Stole the pharaoh's coins"), year: -300 })).toEqual([]);
  });
});
