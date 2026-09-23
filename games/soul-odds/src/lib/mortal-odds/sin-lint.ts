import { ANACHRONISMS } from "@/lib/mortal-odds/time-story";
import type { SinNarratives } from "@/lib/mortal-odds/openrouter";

/** Every anachronistic word the four sins use for a life set in `year`, i.e. words for things that did not exist yet. */
export function findSinAnachronisms(options: { narratives: SinNarratives; year: number }): string[] {
  const { narratives, year } = options;
  const text = Object.values(narratives)
    .map((sin) => `${sin.label}. ${sin.phrase}`)
    .join(" ");
  const hits = ANACHRONISMS.flatMap(({ pattern, earliest }) => (year < earliest ? (text.match(new RegExp(pattern.source, "gi")) ?? []) : []));
  return Array.from(new Set(hits.map((hit) => hit.toLowerCase())));
}
