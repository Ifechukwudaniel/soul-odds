import type { EraConfig } from '@/lib/mortal-odds/config';
import { apiClient } from '@/libs/ApiClient';

/**
 * `/api/mortal-odds/era`'s response: the demographic `EraConfig` for the year (same shape `eraFor`
 * returns locally) plus `era`, the deployed title's `SoulEra` name for it, read from
 * `soul-odds-title.json` so it can't drift from the live contract.
 */
export type EraApiResponse = EraConfig & { era: string };

export async function fetchEra(year: number): Promise<EraApiResponse> {
  const response = await apiClient.get<EraApiResponse>(`/api/mortal-odds/era?year=${year}`);
  return response.data;
}
