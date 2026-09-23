import { NextRequest, NextResponse } from "next/server";
import { sinsConfig } from "@/lib/mortal-odds/config";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";


export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const location = request.nextUrl.searchParams.get("location");

  if (yearParam === null && location === null) {
    return NextResponse.json(sinsConfig);
  }

  const year = Number(yearParam);
  if (yearParam === null || !Number.isFinite(year)) {
    return NextResponse.json({ message: 'Missing or invalid "year" query parameter.' }, { status: 400 });
  }

  if (!location) {
    return NextResponse.json({ message: 'Missing "location" query parameter.' }, { status: 400 });
  }

  try {
    const narratives = await generateSinNarratives({ year, location });
    return NextResponse.json(narratives);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Could not generate sin narratives." }, { status: 502 });
  }
}
