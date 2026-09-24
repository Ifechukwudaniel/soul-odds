import type { RefObject } from 'react';
import { BronzeBadge } from '@/components/assets/BronzeBadge';
import { getRandomAvatarForUser } from '@/components/assets/characters/avatars';
import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { GoldBadge } from '@/components/assets/GoldBadge';
import { SilverBadge } from '@/components/assets/SilverBadge';
import { GameCard } from '@/components/game/home/GameCard';
import { Scroller } from '@/components/Scroller';
import type { LeaderboardUser } from '@/types';
import { cn } from '@/utils';

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  currentUserRowRef?: RefObject<HTMLDivElement | null>;
}

// ✦ "Winnings" is a lifetime total, not profit/loss — it only ever goes up, so a losing streak never shows as a negative number.
const COLUMNS = ['Rank', 'User name', 'Point', 'Winnings'] as const;

// ✦ Rows are a grid (not <tr>) so the current user's row can carry the mystic-glass border and radius; ARIA roles keep the table semantics.
// ✦ Phones drop the Point column (it moves under the name) so the row fits without sideways scrolling.
const ROW_GRID =
  'grid grid-cols-[3.5rem_minmax(0,1fr)_5rem_6rem] items-center gap-4 px-4 max-md:grid-cols-[2rem_minmax(0,1fr)_auto] max-md:gap-3 max-md:px-3';

const RANK_BADGES: Record<number, typeof GoldBadge> = {
  1: GoldBadge,
  2: SilverBadge,
  3: BronzeBadge,
};

const RANK_AVATAR_RING: Record<number, string> = {
  1: 'ring-2 ring-amber-400/70',
  2: 'ring-2 ring-white/30',
  3: 'ring-2 ring-orange-400/40',
};

export function LeaderboardTable({
  users,
  currentUserId,
  currentUserRowRef,
}: LeaderboardTableProps) {
  return (
    <GameCard containerClassName="w-full">
      <Scroller className="max-h-[20rem] max-md:max-h-none">
        <div role="table" className="flex flex-col gap-2 md:min-w-[26rem]">
          <div
            role="row"
            className={cn(ROW_GRID, 'sticky top-0 z-10 bg-[#132126] py-2 text-sm text-[#AFAFAF]')}
          >
            {COLUMNS.map((column) => (
              <div
                key={column}
                role="columnheader"
                className={cn('font-[500]', column === 'Point' && 'max-md:hidden')}
              >
                {column === 'Rank' ? (
                  <>
                    <span className="max-md:hidden">Rank</span>
                    <span className="md:hidden">#</span>
                  </>
                ) : (
                  column
                )}
              </div>
            ))}
          </div>
          {users.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-white/50">
              No ranked players yet. Settle a round to take the first spot.
            </p>
          )}
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const RankBadge = RANK_BADGES[user.rank];
            const AvatarIcon = getRandomAvatarForUser(user.id).Icon;
            return (
              <div
                key={user.id}
                role="row"
                ref={isCurrentUser ? currentUserRowRef : undefined}
                aria-current={isCurrentUser ? 'true' : undefined}
                className={cn(
                  ROW_GRID,
                  'rounded-xl py-3',
                  isCurrentUser
                    ? 'mystic-glass ring-1 ring-[#d4af37]/60 shadow-[0_0_18px_rgba(212,175,55,0.22)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-[#F5B83D]/10'
                    : 'bg-white/[0.03]',
                )}
              >
                <div role="cell" className="font-[700] text-white">
                  {RankBadge ? <RankBadge className="h-8 w-8" /> : user.rank}
                </div>
                <div role="cell" className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      'accent-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-[2px] ring-offset-2 ring-offset-[#18131F] max-md:h-9 max-md:w-9',
                      RANK_AVATAR_RING[user.rank],
                    )}
                  >
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black/70 bg-slate-950">
                      <AvatarIcon className="h-[68%] w-[68%]" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-[500] text-white">@{user.handle}</p>
                    <p className="text-xs text-white/50 md:hidden">{user.points.toLocaleString()} pts</p>
                  </div>
                </div>
                <div role="cell" className="text-white max-md:hidden">
                  {user.points.toLocaleString()}
                </div>
                <div role="cell">
                  <span className="inline-flex items-center gap-1 font-[600]">
                    <CurrencyCoinIcon width={16} height="16" /> {user.reward.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Scroller>
    </GameCard>
  );
}
