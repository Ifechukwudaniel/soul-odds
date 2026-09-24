import type { SinCategoryId } from '@/lib/mortal-odds/config';
import type { SinNarratives } from '@/lib/mortal-odds/sin-variants';
import type { Sin } from '@/types';

function genericPhrase(label: string): { label: string; phrase: string } {
  return { label, phrase: `committed a nameless act of ${label.toLowerCase()}` };
}

/** Used only if the live fetch for this draw's sins never lands before the reveal needs one. */
export function genericSinNarratives(): SinNarratives {
  return {
    violence: genericPhrase('Violence'),
    deceit: genericPhrase('Deceit'),
    greed: genericPhrase('Greed'),
    heresy: genericPhrase('Heresy'),
  };
}

/** Turns the settled crime category's narrative into the `Sin` the reveal and life story use. */
export function sinFromNarrative(
  category: SinCategoryId,
  narrative: { label: string; phrase: string },
  year: number,
): Sin {
  return { id: category, label: narrative.label, phrase: narrative.phrase, from: year, to: null };
}

/** Only "violence"/"deceit"/"greed"/"heresy" have a narrative; "none" (a clean heart) never does. */
export function narrativeFor(
  narratives: SinNarratives | null,
  id: string,
): { label: string; phrase: string } | undefined {
  if (!narratives) return undefined;
  if (id === 'violence' || id === 'deceit' || id === 'greed' || id === 'heresy')
    return narratives[id];
  return undefined;
}
