import { GiSkullCrossedBones } from 'react-icons/gi';
import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { fateLine, fmtShortDate, fmtSigned } from '@/components/game/history/format';
import { GameCard } from '@/components/game/home/GameCard';
import { Scroller } from '@/components/Scroller';
import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';
import { fmtYear } from '@/lib/mortal-odds/format';
import { serifFont } from '@/styles/serif-font';
import { cn } from '@/utils';

const COLUMNS = ['Soul', 'Bets', 'Net', 'Date'] as const;

// Same grid-not-<tr> approach as the leaderboard table; each body row is a button that opens the round's details.
const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_5rem_6rem_5rem] items-center gap-4 px-4';

const NET_COLOR = (net: number) =>
  net > 0 ? 'text-[#6BA84F]' : net < 0 ? 'text-[#B7410E]' : 'text-white';

export const HistoryTable = (props: {
  entries: BetHistoryEntry[];
  onSelect: (entry: BetHistoryEntry) => void;
}) => (
  <GameCard containerClassName="w-full">
    <Scroller className="max-h-[20rem]">
      <div role="table" className="flex min-w-[26rem] flex-col gap-2">
        <div
          role="row"
          className={cn(ROW_GRID, 'sticky top-0 z-10 bg-[#132126] py-2 text-sm text-[#AFAFAF]')}
        >
          {COLUMNS.map((column) => (
            <div key={column} role="columnheader" className="font-[500]">
              {column}
            </div>
          ))}
        </div>
        {props.entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="row"
            onClick={() => props.onSelect(entry)}
            className={cn(
              ROW_GRID,
              'w-full cursor-pointer rounded-xl bg-white/[0.03] py-3 text-left transition-colors hover:bg-white/[0.07]',
            )}
          >
            <span role="cell" className="flex min-w-0 items-center gap-3">
              <span className="accent-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-[2px] ring-offset-2 ring-offset-[#18131F]">
                <span className="flex h-full w-full items-center justify-center rounded-full border border-black/70 bg-slate-950">
                  <GiSkullCrossedBones size={22} className="text-[#F5B83D]" />
                </span>
              </span>
              <span className="min-w-0">
                <span
                  className={`${serifFont.className} block truncate text-sm font-bold text-[#F3D38F]`}
                >
                  {fateLine(entry)}
                </span>
                <span className="block truncate text-xs text-white/50">
                  Born {fmtYear(entry.bornYear)}
                </span>
              </span>
            </span>
            <span role="cell" className="text-sm text-white">
              {entry.bets.length === 0
                ? '–'
                : `${entry.bets.filter((bet) => bet.won).length} / ${entry.bets.length}`}
            </span>
            <span role="cell">
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-[600]',
                  NET_COLOR(entry.roundNet),
                )}
              >
                <CurrencyCoinIcon width={16} height="16" /> {fmtSigned(entry.roundNet)}
              </span>
            </span>
            <span role="cell" className="text-sm text-white/70">
              {fmtShortDate(entry.settledAt)}
            </span>
          </button>
        ))}
      </div>
    </Scroller>
  </GameCard>
);
