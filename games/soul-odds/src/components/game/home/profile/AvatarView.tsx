'use client';

import { useRef, useState } from 'react';
import { FaCheck, FaLock } from 'react-icons/fa';
import { AVATARS, getAvatarById } from '@/components/assets/characters/avatars';
import { GameButton } from '@/components/game/GameButton';
import { ModalHeader } from '@/components/game/GameModalParts';
import { Scroller } from '@/components/Scroller';
import { setUserAvatar } from '@/services/data/user';
import { useAppStore } from '@/services/store/store';
import { notification } from '@/utils/notifications';
import { playClickSound } from '@/utils/playClickSound';

// ✦ The grid is 3 columns wide (see the `grid-cols-3` below); arrow-key roving needs that number to move up/down a row.
const GRID_COLUMNS = 3;
const ARROW_MOVE: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: GRID_COLUMNS,
  ArrowUp: -GRID_COLUMNS,
};

/**
 * The avatar picker shown inside the profile card. It fills the height the card already has: the
 * avatar grid scrolls when there are more avatars than fit, so adding avatars never grows the card.
 */
export const AvatarView = (props: { onBack: () => void }) => {
  const equippedAvatarId = useAppStore((state) => state.user.avatarId);
  const balance = useAppStore((state) => state.user.balance);
  const address = useAppStore((state) => state.user.address);
  const updateUser = useAppStore((state) => state.updateUser);
  // ✦ Null until the player taps a tile, so the picker follows the equipped avatar (e.g. when the
  //   login sync loads the saved one) instead of freezing on whatever was equipped when it mounted.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId = pickedId ?? equippedAvatarId;
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selectedAvatar = getAvatarById(selectedId);
  const isAlreadyEquipped = selectedId === equippedAvatarId;
  const canAfford = selectedAvatar.cost <= balance;

  const equipButtonLabel = () => {
    if (isAlreadyEquipped) {
      return 'Equipped';
    }
    if (canAfford) {
      return `Equip ${selectedAvatar.name}`;
    }
    return 'Not enough coins';
  };

  // ✦ Roving tabindex: only the selected tile is a Tab stop. Arrows move selection and focus, clamped
  //   at the grid's edges.
  const moveSelection = (fromIndex: number, key: string) => {
    const delta = ARROW_MOVE[key];
    const targetIndex =
      key === 'Home'
        ? 0
        : key === 'End'
          ? AVATARS.length - 1
          : delta === undefined
            ? null
            : fromIndex + delta;
    if (targetIndex === null) {
      return;
    }
    const target = AVATARS[Math.min(Math.max(targetIndex, 0), AVATARS.length - 1)];
    if (!target) {
      return;
    }
    setPickedId(target.id);
    tileRefs.current[target.id]?.focus();
  };

  const goBack = () => {
    setPickedId(null);
    props.onBack();
  };

  const equip = () => {
    playClickSound();
    const previousId = equippedAvatarId;
    updateUser({ avatarId: selectedId });
    goBack();
    // ✦ Saved server-side so the leaderboard shows it; if that fails, the choice rolls back so
    //   what the player sees never drifts from what everyone else sees.
    if (address) {
      setUserAvatar(address, selectedId).catch(() => {
        updateUser({ avatarId: previousId });
        notification.error('Avatar not saved');
      });
    }
  };

  return (
    <>
      <ModalHeader title="Choose your avatar" />

      <Scroller className="min-h-0 flex-1">
        <div
          role="radiogroup"
          aria-label="Choose your avatar"
          className="grid grid-cols-3 gap-3 p-1"
        >
          {AVATARS.map((avatar, index) => {
            const isSelected = avatar.id === selectedId;
            const isEquipped = avatar.id === equippedAvatarId;
            const isLocked = avatar.cost > balance;

            return (
              <button
                key={avatar.id}
                ref={(node) => {
                  tileRefs.current[avatar.id] = node;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${avatar.name}${avatar.cost > 0 ? `, ${avatar.cost} coins` : ''}${isEquipped ? ', equipped' : ''}`}
                tabIndex={isSelected ? 0 : -1}
                onKeyDown={(event) => {
                  if (event.key in ARROW_MOVE || event.key === 'Home' || event.key === 'End') {
                    event.preventDefault();
                    moveSelection(index, event.key);
                  }
                }}
                onClick={() => {
                  playClickSound();
                  setPickedId(avatar.id);
                }}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors ${
                  isSelected ? 'border-[#F5B83D] bg-white/10' : 'border-white/10 bg-white/5'
                }`}
              >
                {isEquipped && (
                  <span
                    aria-hidden="true"
                    className="gold absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-black"
                  >
                    <FaCheck className="h-2.5 w-2.5 text-slate-950" />
                  </span>
                )}

                {/* ✦ The tile's own aria-label already covers name/cost/equipped; hide these decorative icons from AT browse mode. ✦ */}
                <div
                  aria-hidden="true"
                  className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black p-1"
                  style={{
                    background: isSelected
                      ? 'conic-gradient(from 180deg, #FDE991, #B07464, #7B6A72, #5F6166, #BAAF7F, #FDE991)'
                      : '#2A2530',
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950">
                    <avatar.Icon width={40} height="40" />
                  </div>
                </div>

                <p className="truncate text-xs font-semibold text-white/80">{avatar.name}</p>

                {avatar.cost > 0 && (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold ${isLocked ? 'text-white/40' : 'text-[#F5B83D]'}`}
                  >
                    {isLocked && <FaLock className="h-2.5 w-2.5" />}
                    {avatar.cost}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Scroller>

      <div className="flex items-center gap-3">
        <GameButton variant="secondary" onClick={goBack} className="shrink-0 px-5 py-2.5 text-sm">
          ← Back
        </GameButton>
        <button
          type="button"
          disabled={isAlreadyEquipped || !canAfford}
          onClick={equip}
          className={`btn min-w-0 flex-1 cursor-pointer rounded-lg py-3 font-bold disabled:cursor-not-allowed ${
            isAlreadyEquipped || !canAfford
              ? 'bg-[#A7A7A7] text-black opacity-50'
              : 'gold text-slate-950'
          }`}
        >
          {equipButtonLabel()}
        </button>
      </div>
    </>
  );
};
