'use client';

import { useId, useRef, useState } from 'react';
import { FaCheck, FaLock } from 'react-icons/fa';
import { AVATARS, getAvatarById } from '@/components/assets/characters/avatars';
import { GameDialog } from '@/components/game/GameDialog';
import { ModalCloseButton, ModalHeader } from '@/components/game/GameModalParts';
import { useAppStore } from '@/services/store/store';
import { playClickSound } from '@/utils/playClickSound';

// The grid is 3 columns wide (see the `grid-cols-3` below); arrow-key roving needs that number to move up/down a row.
const GRID_COLUMNS = 3;
const ARROW_MOVE: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: GRID_COLUMNS,
  ArrowUp: -GRID_COLUMNS,
};

export const AvatarPickerModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const equippedAvatarId = useAppStore((state) => state.user.avatarId);
  const balance = useAppStore((state) => state.user.balance);
  const updateUser = useAppStore((state) => state.updateUser);
  const [selectedId, setSelectedId] = useState(equippedAvatarId);
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const titleId = useId();

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

  // Roving tabindex: only the selected tile is a Tab stop, like a native radio group. Arrow keys move the
  // selection (and focus) between tiles instead, clamped to the grid's edges rather than wrapping around.
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
    setSelectedId(target.id);
    tileRefs.current[target.id]?.focus();
  };

  return (
    <GameDialog
      isOpen={props.isOpen}
      onClose={props.onClose}
      labelledBy={titleId}
      className="w-full max-w-md"
    >
      <div className="relative flex flex-col gap-5 p-6">
        <ModalCloseButton onClick={props.onClose} />

        <ModalHeader title="Choose your avatar" titleId={titleId} />

        <div role="radiogroup" aria-label="Choose your avatar" className="grid grid-cols-3 gap-3">
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
                  setSelectedId(avatar.id);
                }}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors ${
                  isSelected ? 'border-[#F5B83D] bg-white/10' : 'border-white/10 bg-white/5'
                }`}
              >
                {isEquipped && (
                  <span
                    aria-hidden="true"
                    className="accent-gradient absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-black"
                  >
                    <FaCheck className="h-2.5 w-2.5 text-slate-950" />
                  </span>
                )}

                {/* The tile's own aria-label already covers name/cost/equipped; hide these decorative icons from AT browse mode. */}
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

        <button
          type="button"
          disabled={isAlreadyEquipped || !canAfford}
          onClick={() => {
            playClickSound();
            updateUser({ avatarId: selectedId });
            props.onClose();
          }}
          className={`btn w-full cursor-pointer rounded-lg py-3 font-bold disabled:cursor-not-allowed ${
            isAlreadyEquipped || !canAfford
              ? 'bg-[#A7A7A7] text-black opacity-50'
              : 'accent-gradient text-slate-950'
          }`}
        >
          {equipButtonLabel()}
        </button>
      </div>
    </GameDialog>
  );
};
