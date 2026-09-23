import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { generateLifeStory } from "@/lib/mortal-odds/openrouter";

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const params = request.nextUrl.searchParams;
  const sex = params.get("sex");
  const location = params.get("location");
  const year = Number(params.get("year"));
  const age = Number(params.get("age"));
  const deathYear = Number(params.get("deathYear"));

  if (sex !== "girl" && sex !== "boy") {
    return NextResponse.json({ message: '"sex" must be "girl" or "boy".' }, { status: 400 });
  }
  if (!location) {
    return NextResponse.json({ message: 'Missing "location" query parameter.' }, { status: 400 });
  }
  if (!Number.isFinite(year)) {
    return NextResponse.json({ message: 'Missing or invalid "year" query parameter.' }, { status: 400 });
  }
  if (!Number.isFinite(age)) {
    return NextResponse.json({ message: 'Missing or invalid "age" query parameter.' }, { status: 400 });
  }
  if (!Number.isFinite(deathYear)) {
    return NextResponse.json({ message: 'Missing or invalid "deathYear" query parameter.' }, { status: 400 });
  }

  const startedAt = Date.now();
  try {
    const narrative = await generateLifeStory({
      sex,
      location,
      year,
      age,
      deathYear,
      sinPhrase: params.get("sinPhrase"),
      cause: params.get("cause"),
    });
    console.log(`[life-story] request handled in ${Date.now() - startedAt}ms`);
    return NextResponse.json(narrative);
  } catch (error) {
    console.error(`[life-story] request failed after ${Date.now() - startedAt}ms`, error);
    return NextResponse.json({ message: "Could not generate a life story." }, { status: 502 });
  }
}
