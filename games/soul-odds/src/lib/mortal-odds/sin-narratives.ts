import { apiClient } from "@/libs/ApiClient";
import type { SinNarratives, SinPlaceContext } from "@/lib/mortal-odds/sin-variants";

/** Fetches this draw's four era-specific sin narratives from the backend. */
export async function fetchSinNarratives(options: { year: number; location: string; place?: SinPlaceContext }): Promise<SinNarratives> {
  const params = new URLSearchParams({ year: String(options.year), location: options.location });
  const { place } = options;
  if (place) {
    params.set("lat", String(place.lat));
    params.set("lon", String(place.lon));
    if (place.fromYear !== undefined) params.set("fromYear", String(place.fromYear));
    if (place.toYear !== undefined) params.set("toYear", String(place.toYear));
  }
  const response = await apiClient.get<SinNarratives>(`/api/mortal-odds/sins?${params.toString()}`);
  return response.data;
}
