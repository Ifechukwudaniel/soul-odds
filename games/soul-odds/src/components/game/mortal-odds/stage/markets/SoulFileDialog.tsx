import { GiEarthAfricaEurope, GiHourglass, GiScrollUnfurled } from 'react-icons/gi';
import { InfoDialog } from '@/components/game/InfoDialog';
import { fmtYear } from '@/lib/mortal-odds/format';
import type { Draw, PlaceContext } from '@/types';

/**
 * A pill in the predictions header that always names who the bets are about, and opens their file:
 * where and when they lived, and the story. Context only; the odds are already priced from the draw.
 */
export const SoulFileDialog = (props: { draw: Draw; context: PlaceContext }) => {
  const year = fmtYear(props.draw.year);
  const place = props.draw.place.name.split(', ')[0];

  return (
    <InfoDialog
      title="This soul's file"
      intro="Everything the scribes hold on the soul you are betting on."
      points={[
        {
          icon: GiScrollUnfurled,
          title: `Born ${year} in ${place}`,
          text: props.context.when,
        },
        { icon: GiEarthAfricaEurope, title: 'The land', text: props.context.local },
        { icon: GiHourglass, title: 'Their life', text: props.context.story },
      ]}
      trigger={(open) => (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`This soul's file: born ${year} in ${place}`}
          onClick={open}
          className="flex max-w-[60%] min-w-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#d4af37]/50 bg-[#F5B83D]/10 px-3 py-1 text-xs text-[#F1D6AE] transition-colors hover:bg-[#F5B83D]/25 max-md:py-1.5"
        >
          <GiScrollUnfurled size={14} className="gold-icon shrink-0" />
          <span className="truncate">
            {place} · {year}
          </span>
        </button>
      )}
    />
  );
};
