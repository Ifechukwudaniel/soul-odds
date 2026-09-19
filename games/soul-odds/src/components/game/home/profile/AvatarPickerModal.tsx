"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaCheck, FaLock } from "react-icons/fa";
import { CloseIcon } from "@/components/assets/CloseIcon";
import { AVATARS, getAvatarById } from "@/components/assets/characters/avatars";
import { useAppStore } from "@/services/store/store";
import { playClickSound } from "@/utils/playClickSound";

export const AvatarPickerModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const equippedAvatarId = useAppStore((state) => state.user.avatarId);
  const balance = useAppStore((state) => state.user.balance);
  const updateUser = useAppStore((state) => state.updateUser);
  const [selectedId, setSelectedId] = useState(equippedAvatarId);

  const selectedAvatar = getAvatarById(selectedId);
  const isAlreadyEquipped = selectedId === equippedAvatarId;
  const canAfford = selectedAvatar.cost <= balance;

  const equipButtonLabel = () => {
    if (isAlreadyEquipped) {
      return "Equipped";
    }
    if (canAfford) {
      return `Equip ${selectedAvatar.name}`;
    }
    return "Not enough coins";
  };

  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4"
          onClick={() => {
            playClickSound();
            props.onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-md flex-col gap-5 rounded-3xl bg-[#18131FE5] p-6"
            style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          >
            <button
              type="button"
              onClick={() => {
                playClickSound();
                props.onClose();
              }}
              className="absolute top-4 right-4"
            >
              <CloseIcon />
            </button>

            <h2 className="text-lg font-bold text-white">Choose Your Avatar</h2>

            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((avatar) => {
                const isSelected = avatar.id === selectedId;
                const isEquipped = avatar.id === equippedAvatarId;
                const isLocked = avatar.cost > balance;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedId(avatar.id);
                    }}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors ${
                      isSelected ? "border-[#F5B83D] bg-white/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    {isEquipped && (
                      <span className="accent-gradient absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-black">
                        <FaCheck className="h-2.5 w-2.5 text-slate-950" />
                      </span>
                    )}

                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-black p-1"
                      style={{
                        background: isSelected
                          ? "conic-gradient(from 180deg, #FDE991, #B07464, #7B6A72, #5F6166, #BAAF7F, #FDE991)"
                          : "#2A2530",
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950">
                        <avatar.Icon width={40} height="40" />
                      </div>
                    </div>

                    <p className="truncate text-xs font-semibold text-white/80">{avatar.name}</p>

                    {avatar.cost > 0 && (
                      <span
                        className={`flex items-center gap-1 text-[11px] font-bold ${
                          isLocked ? "text-white/40" : "text-[#F5B83D]"
                        }`}
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
              className={`btn w-full rounded-lg py-3 font-bold ${
                isAlreadyEquipped || !canAfford
                  ? "cursor-not-allowed bg-[#A7A7A7] text-black opacity-50"
                  : "accent-gradient text-slate-950"
              }`}
            >
              {equipButtonLabel()}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
