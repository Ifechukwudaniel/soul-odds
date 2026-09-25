import { useRef } from 'react';
import { BookieOdds } from '@/components/game/mortal-odds/stage/markets/BookieOdds';
import { getMarketIcon } from '@/lib/mortal-odds/market-icons';
import type { MarketConfig, MarketOption, Price } from '@/types';
import { playClickSound } from '@/utils/playClickSound';

// ✦ The grid is 2 columns wide (see the `grid-cols-2` below); arrow-key roving needs that number to move up/down a row.
const GRID_COLUMNS = 2;
const ARROW_MOVE: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: GRID_COLUMNS,
  ArrowUp: -GRID_COLUMNS,
};

export const ChoiceMarket = (props: {
  market: MarketConfig;
  prices: Record<string, Price>;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
}) => {
  const Icon = getMarketIcon(props.market.id);
  const selectedOdds = props.selectedOptionId
    ? props.prices[props.selectedOptionId]?.odds
    : undefined;
  const options = props.market.options.filter((option) => option.id in props.prices);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const isPickable = (option: MarketOption) => {
    const price = props.prices[option.id];
    return !!price && price.odds !== null;
  };

  // ✦ Only the selected (or first pickable) option is a Tab stop. Arrows move focus and pick
  //   together, clamped at the edges and skipping closed options.
  const rovingId = props.selectedOptionId ?? options.find(isPickable)?.id;

  const moveSelection = (fromIndex: number, key: string) => {
    const delta = ARROW_MOVE[key];
    const rawTarget =
      key === 'Home'
        ? 0
        : key === 'End'
          ? options.length - 1
          : delta === undefined
            ? null
            : fromIndex + delta;
    if (rawTarget === null) {
      return;
    }
    const step = key === 'End' ? -1 : key === 'Home' ? 1 : Math.sign(delta ?? 1) || 1;
    let index = Math.min(Math.max(rawTarget, 0), options.length - 1);
    while (index >= 0 && index < options.length && !isPickable(options[index]!)) {
      index += step;
    }
    const target = options[index];
    if (!target) {
      return;
    }
    playClickSound();
    props.onSelect(target.id);
    optionRefs.current[target.id]?.focus();
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 text-center max-md:gap-3">
      <div className="flex flex-col items-center gap-1">
        <Icon size={32} className="gold-icon" />
        <h3 className="text-xl font-bold text-white max-md:text-lg">{props.market.title}</h3>
        {props.market.note && <p className="max-w-xs text-xs text-white/40">{props.market.note}</p>}
        <BookieOdds odds={selectedOdds} />
      </div>

      <div
        role="radiogroup"
        aria-label={props.market.title}
        className="grid w-full max-w-xl grid-cols-2 gap-3"
      >
        {options.map((option, index) => {
          const isSelected = props.selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              ref={(node) => {
                optionRefs.current[option.id] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isPickable(option)}
              tabIndex={option.id === rovingId ? 0 : -1}
              onKeyDown={(event) => {
                if (event.key in ARROW_MOVE || event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  moveSelection(index, event.key);
                }
              }}
              onClick={() => {
                playClickSound();
                props.onSelect(option.id);
              }}
              className={`rounded-lg border px-4 py-4 text-base max-md:py-3 font-semibold disabled:opacity-40 ${
                isSelected
                  ? 'gold border-black text-slate-950 shadow-[inset_1px_1px_1.5px_0px_#FFFFFF66]'
                  : 'border-black bg-[#262433] text-[#AFAFAF]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
