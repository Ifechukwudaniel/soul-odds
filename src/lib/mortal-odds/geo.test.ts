import { describe, expect, it } from "vitest";
import { erasConfig, placesConfig, worldLand } from "@/lib/mortal-odds/config";
import { densityField, eraFor, graticule, landPath, project } from "@/lib/mortal-odds/geo";

const viewport = { width: 360, height: 180 };

describe("project", () => {
  it("maps the antimeridian and poles to viewport corners", () => {
    expect(project({ lon: -180, lat: 90, viewport })).toEqual({ x: 0, y: 0 });
    expect(project({ lon: 180, lat: -90, viewport })).toEqual({ x: 360, y: 180 });
  });

  it("maps null island to the viewport centre", () => {
    expect(project({ lon: 0, lat: 0, viewport })).toEqual({ x: 180, y: 90 });
  });

  it("scales with viewport size", () => {
    expect(project({ lon: 0, lat: 0, viewport: { width: 1000, height: 500 } })).toEqual({ x: 500, y: 250 });
  });
});

describe("landPath", () => {
  it("closes every ring it draws", () => {
    const path = landPath({ rings: [[[0, 0], [10, 0], [10, 10], [0, 10]]], viewport });
    expect(path).toBe("M180.0 90.0L190.0 90.0L190.0 80.0L180.0 80.0Z");
  });

  it("emits one subpath per ring", () => {
    const path = landPath({ rings: worldLand, viewport });
    expect(path.match(/Z/g)).toHaveLength(worldLand.length);
  });
});

describe("graticule", () => {
  it("excludes the frame edges", () => {
    const { verticals, horizontals } = graticule({ stepDegrees: 30, viewport });
    expect(verticals).not.toContain(0);
    expect(verticals).not.toContain(viewport.width);
    expect(horizontals).not.toContain(0);
    expect(horizontals).not.toContain(viewport.height);
  });

  it("places the equator halfway down", () => {
    expect(graticule({ stepDegrees: 30, viewport }).horizontals).toContain(90);
  });
});

describe("eraFor", () => {
  it("returns the era containing the year", () => {
    const era = eraFor({ year: -10_000, erasConfig });
    expect(era.from).toBeLessThanOrEqual(-10_000);
    expect(era.to === null || era.to > -10_000).toBe(true);
  });

  it("falls back to the last era for present-day years", () => {
    expect(eraFor({ year: 5000, erasConfig })).toBe(erasConfig[erasConfig.length - 1]);
  });
});

describe("densityField", () => {
  it("covers every configured place", () => {
    const blobs = densityField({ year: 1, erasConfig, placesConfig, viewport });
    const placeCount = Object.values(placesConfig).reduce((sum, places) => sum + places.length, 0);
    expect(blobs).toHaveLength(placeCount);
  });

  it("normalises the densest place of the year to 1", () => {
    const blobs = densityField({ year: 1, erasConfig, placesConfig, viewport });
    expect(Math.max(...blobs.map((blob) => blob.intensity))).toBeCloseTo(1);
    expect(Math.min(...blobs.map((blob) => blob.intensity))).toBeGreaterThan(0);
  });

  it("shifts weight between eras as regional shares change", () => {
    const stoneAge = densityField({ year: -40_000, erasConfig, placesConfig, viewport });
    const modern = densityField({ year: 1900, erasConfig, placesConfig, viewport });
    const sahel = (blobs: typeof stoneAge) => blobs.find((blob) => blob.id === "the West African Sahel")?.intensity;
    expect(sahel(stoneAge)).not.toBeCloseTo(sahel(modern) ?? 0);
  });

  it("keeps blobs inside the viewport", () => {
    for (const blob of densityField({ year: 1, erasConfig, placesConfig, viewport })) {
      expect(blob.x).toBeGreaterThanOrEqual(0);
      expect(blob.x).toBeLessThanOrEqual(viewport.width);
      expect(blob.y).toBeGreaterThanOrEqual(0);
      expect(blob.y).toBeLessThanOrEqual(viewport.height);
    }
  });
});
