const INCEPTION_PROPS = ["P571", "P580"];
const DISSOLVED_PROPS = ["P576", "P582"];

type WikidataEntity = {
  claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: { time?: string } } } }>>;
};

/** Reads a Wikidata time claim's year (handles the leading `+`/`-` era sign Wikidata uses). */
function claimYear(entity: WikidataEntity | undefined, properties: string[]): number | null {
  for (const property of properties) {
    const time = entity?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value?.time;
    const match = time?.match(/^([+-]\d+)-/);
    if (match?.[1]) return Number(match[1]);
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches an entity's known founding/dissolution years from Wikidata, or `null` for each if
 * unknown there. Retries with backoff on a 429/5xx (Wikidata throttles clients that hammer it),
 * since those come back as a plain-text throttle notice, not JSON.
 */
export async function fetchWikidataDates(
  qid: string,
  attempt = 1,
): Promise<{ inception: number | null; dissolved: number | null }> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "soul-odds-cliopatria-correct/1.0 (https://github.com/Ifechukwudaniel/wo-)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      return fetchWikidataDates(qid, attempt + 1);
    }
    throw new Error(`Wikidata request for ${qid} failed with ${response.status}`);
  }

  const data = (await response.json()) as { entities?: Record<string, WikidataEntity> };
  const entity = data.entities?.[qid];
  return {
    inception: claimYear(entity, INCEPTION_PROPS),
    dissolved: claimYear(entity, DISSOLVED_PROPS),
  };
}
