import { apiClient } from '@/libs/ApiClient';
import type { Place } from '@/types';

type PlaceApiResponse =
  | {
      name: string;
      lat: number;
      lon: number;
      fromYear: number;
      toYear: number;
      population?: number;
      continent?: string;
      year: number;
      source: 'cliopatria';
    }
  | {
      name: string;
      lat: number;
      lon: number;
      fromYear: number;
      toYear: number;
      region: string;
      regionShare: number;
      year: number;
      source: 'places-fallback';
    };

/**
 * Normalizes `/api/mortal-odds/place`'s two response shapes into one `Place`: a real historical
 * polity (Cliopatria) carries its attested date range, the synthetic fallback carries its
 * weighted population share — never both, see `Place`'s own doc comment.
 */
export function toPlace(response: PlaceApiResponse): Place {
  if (response.source === 'cliopatria') {
    return {
      name: response.name,
      lat: response.lat,
      lon: response.lon,
      fromYear: response.fromYear,
      toYear: response.toYear,
      population: response.population,
      continent: response.continent,
    };
  }
  return { name: response.name, lat: response.lat, lon: response.lon, share: response.regionShare };
}

/** Fetches the place for a birth year from the backend — real Cliopatria data when it covers that year, else the synthetic fallback. */
export async function fetchPlace(year: number): Promise<Place> {
  const response = await apiClient.get<PlaceApiResponse>(`/api/mortal-odds/place?year=${year}`);
  return toPlace(response.data);
}
