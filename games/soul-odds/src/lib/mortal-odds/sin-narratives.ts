import { apiClient } from "@/libs/ApiClient";
import type { SinNarratives } from "@/lib/mortal-odds/openrouter";

/** Fetches this draw's four era-specific sin narratives from the backend. */
export async function fetchSinNarratives(options: { year: number; location: string }): Promise<SinNarratives> {
  const response = await apiClient.get<SinNarratives>(`/api/mortal-odds/sins?year=${options.year}&location=${encodeURIComponent(options.location)}`);
  return response.data;
}
