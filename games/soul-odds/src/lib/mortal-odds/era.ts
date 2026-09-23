import type { EraConfig } from "@/lib/mortal-odds/config";

/**
 * `/api/mortal-odds/era`'s response: the demographic `EraConfig` for the year (same shape
 * `eraFor` returns locally) plus `era`, the deployed title's actual `SoulEra` name for that year
 * — read straight off `soul-odds-title.json`, so it can never drift from the live contract.
 */
export type EraApiResponse = EraConfig & { era: string };

/** Fetches the demographic era and the on-chain SoulEra name for a birth year from the backend. */
export async function fetchEra(year: number): Promise<EraApiResponse> {
  const response = await fetch(`/api/mortal-odds/era?year=${year}`);
  if (!response.ok) throw new Error(`Failed to fetch era for year ${year}`);
  return (await response.json()) as EraApiResponse;
}
