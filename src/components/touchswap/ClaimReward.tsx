import React from "react";
import { Balance } from "../Balance";
import { CloseIcon } from "../assets/CloseIcon";
import { CongratsIcon } from "../assets/CongratsIcon";
import { RefsIcon } from "../assets/RefsIcon";
import { AnimatePresence, motion } from "framer-motion";
import { BlockList } from "net";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

type ModalProps = {
  onClose?: () => void;
  isOpen: boolean;
  reward: number;
};

export const ClaimReward: React.FC<ModalProps> = ({ onClose, isOpen, reward }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div key={"fff"}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{
              y: 0,
            }}
            exit={{
              y: "100%",
            }}
            transition={{ type: "spring", bounce: 0, duration: 0.7 }}
            className="fixed z-[50]  overflow-y-scroll bottom-0 h-[100%] w-full bg-[#18131FE5] px-3 py-6 text-center flex flex-col  left-0"
            style={{
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-col text-center my-6 h-full justify-center mt-16 items-center">
              <div>
                <Fireworks autorun={{ speed: 1 }} />
                <CongratsIcon />
              </div>
              <div className="mb-10 mt-1 flex flex-col items-center">
                <p className="font-bold mb-1">Reward claimed</p>
                <Balance count={reward} size="xl" />
              </div>

              <button
                className="btn bg-white w-full text-black py-4 font-[700] rounded-lg align-baseline"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            <button className="absolute top-3 right-3 py-2 px-4 mt-3" onClick={onClose}>
              <CloseIcon />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
