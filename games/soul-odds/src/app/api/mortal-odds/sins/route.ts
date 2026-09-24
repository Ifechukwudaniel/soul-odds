import { NextRequest, NextResponse } from 'next/server';
import { sinsConfig } from '@/lib/mortal-odds/config';
import type { SinPlaceContext } from '@/lib/mortal-odds/sin-variants';
import { requireApiSecret } from '@/libs/ApiAuth';
import { findNearestCliopatriaPlace } from '@/services/db/cliopatria';
import { findSinVariantsCovering } from '@/services/db/sin-catalog';

/** Reads the optional place details (`lat`, `lon` and, for real polities, `fromYear`/`toYear`); undefined unless the coordinates are both valid. */
function readPlaceContext(params: URLSearchParams): SinPlaceContext | undefined {
  const finite = (key: string) =>
    params.get(key) === null
      ? undefined
      : Number.isFinite(Number(params.get(key)))
        ? Number(params.get(key))
        : undefined;
  const lat = finite('lat');
  const lon = finite('lon');
  if (lat === undefined || lon === undefined) return undefined;
  return { lat, lon, fromYear: finite('fromYear'), toYear: finite('toYear') };
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const yearParam = request.nextUrl.searchParams.get('year');
  const location = request.nextUrl.searchParams.get('location');

  if (yearParam === null && location === null) {
    return NextResponse.json(sinsConfig);
  }

  const year = Number(yearParam);
  if (yearParam === null || !Number.isFinite(year)) {
    return NextResponse.json(
      { message: 'Missing or invalid "year" query parameter.' },
      { status: 400 },
    );
  }

  if (!location) {
    return NextResponse.json({ message: 'Missing "location" query parameter.' }, { status: 400 });
  }

  // ✦ Only variants written for this year's period are served (an empire spans centuries); a place
  //   with none borrows the nearest polity alive that year.
  const place = readPlaceContext(request.nextUrl.searchParams);
  const nearest = place
    ? await findNearestCliopatriaPlace({ lat: place.lat, lon: place.lon, year })
    : undefined;
  const own = await findSinVariantsCovering(location, year);
  const covering =
    own.length > 0 ? own : nearest ? await findSinVariantsCovering(nearest.name, year) : [];

  if (covering.length === 0) {
    return NextResponse.json(
      { message: 'No sin narratives for this place and year.' },
      { status: 404 },
    );
  }

  return NextResponse.json(pickRandom(covering).narratives);
}
