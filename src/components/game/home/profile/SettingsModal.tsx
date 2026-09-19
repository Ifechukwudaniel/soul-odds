"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { CloseIcon } from "@/components/assets/CloseIcon";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { playClickSound } from "@/utils/playClickSound";

export const SettingsModal = (props: { isOpen: boolean; onClose: () => void }) => {
  const { isMuted, toggle, volume, setVolume } = useBackgroundMusic();

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

            <h2 className="text-lg font-bold text-white">Settings</h2>

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Music volume</p>
                <button
                  type="button"
                  aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                  onClick={() => {
                    playClickSound();
                    toggle();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white transition-colors hover:bg-white/10"
                >
                  {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                </button>
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                disabled={isMuted}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-full accent-[#F5B83D] disabled:opacity-40"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
