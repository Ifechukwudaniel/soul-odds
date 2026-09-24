import { NextRequest, NextResponse } from 'next/server';
import {
  describePopulation,
  estimatePopulation,
  estimatesAt,
} from '@/lib/mortal-odds/population-estimate';
import { requireApiSecret } from '@/libs/ApiAuth';

/**
 * Estimated population of an empire in a year: `?empire=Roman Empire&year=100` (or `?wikidata=Q2277&year=100`); the response includes a `text` line saying it in words.
 * With only `year`, lists every polity alive that year, most populous first. Years are negative for BCE.
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const params = request.nextUrl.searchParams;
  const empire = params.get('empire') ?? undefined;
  const wikidata = params.get('wikidata') ?? undefined;
  const year = Number(params.get('year'));

  if (!params.get('year') || !Number.isInteger(year)) {
    return NextResponse.json(
      { message: 'Missing or invalid "year" query parameter (a whole number, negative for BCE).' },
      { status: 400 },
    );
  }

  if (!empire && !wikidata) {
    return NextResponse.json({ year, polities: estimatesAt(year) });
  }

  const estimate = estimatePopulation({ empire, wikidata, year });
  if (!estimate) {
    return NextResponse.json(
      { message: 'No empire by that name existed in that year.' },
      { status: 404 },
    );
  }
  return NextResponse.json({ ...estimate, text: describePopulation({ empire, wikidata, year }) });
}
