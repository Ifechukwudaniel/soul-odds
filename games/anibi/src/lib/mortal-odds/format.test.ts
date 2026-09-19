import { describe, expect, it } from "vitest";
import { fmtNumber, fmtPeople, fmtYear, periodName } from "@/lib/mortal-odds/format";

describe("fmtNumber", () => {
  it("adds thousands separators and rounds to 2 decimals", () => {
    expect(fmtNumber(12345.678)).toBe("12,345.68");
  });
});

describe("fmtYear", () => {
  it("formats non-positive years as BCE", () => {
    expect(fmtYear(-100)).toBe("101 BCE");
    expect(fmtYear(0)).toBe("1 BCE");
  });

  it("formats large BCE years with separators", () => {
    expect(fmtYear(-50000)).toBe("50,001 BCE");
  });

  it("formats years before 1500 as CE", () => {
    expect(fmtYear(1000)).toBe("1000 CE");
  });

  it("formats years from 1500 on with no suffix", () => {
    expect(fmtYear(1800)).toBe("1800");
    expect(fmtYear(2024)).toBe("2024");
  });
});

describe("fmtPeople", () => {
  it("formats billions", () => {
    expect(fmtPeople(1.5e9)).toBe("1.5 billion");
  });

  it("formats millions", () => {
    expect(fmtPeople(2e6)).toBe("2 million");
  });

  it("formats thousands", () => {
    expect(fmtPeople(3e3)).toBe("3 thousand");
  });

  it("formats small counts as-is", () => {
    expect(fmtPeople(999)).toBe("999");
  });
});

describe("periodName", () => {
  it.each([
    [-10001, "Old Stone Age"],
    [-10000, "New Stone Age"],
    [-3301, "New Stone Age"],
    [-3300, "Bronze Age"],
    [-1201, "Bronze Age"],
    [-1200, "Iron Age"],
    [-501, "Iron Age"],
    [-500, "Classical era"],
    [499, "Classical era"],
    [500, "Middle Ages"],
    [1499, "Middle Ages"],
    [1500, "Early modern era"],
    [1799, "Early modern era"],
    [1800, "Industrial age"],
    [1949, "Industrial age"],
    [1950, "Modern era"],
  ])("maps year %i to %s", (year, expected) => {
    expect(periodName(year)).toBe(expected);
  });
});
