import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CloseIcon } from "./assets/CloseIcon";
import { DoubleCoin } from "./assets/DoubleCoin";
import { useAppStore } from "@/services/store/store";
import { playClickSound } from "@/utils/playClickSound";
import { AnimatePresence, motion } from "framer-motion";

type ModalProps = {
  onClose?: () => void;
  title: string;
  text: string;
  cost: number;
  children?: React.ReactNode;
  isOpen: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  level?: number;
  maxLevel?: number;
  disabled?: boolean;
  noLevel?: boolean;
};

const useIsDesktop = (breakpoint = 768) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isDesktop;
};

export const Modal: React.FC<ModalProps> = ({
  title,
  text,
  cost,
  onClose,
  children,
  isOpen,
  icon,
  onClick,
  maxLevel,
  level,
  disabled = false,
  noLevel = false,
}) => {
  const balance = useAppStore(state => state.user!.balance);
  const isLevelCompleted = maxLevel! > 0 && level == maxLevel;
  const isDisabled = disabled || isLevelCompleted;
  const isDesktop = useIsDesktop();

  const sheetVariants = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.95, y: 0 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 0 },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="modal">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[19] bg-black/10"
            onClick={onClose}
          />

          <motion.div
            initial={sheetVariants.initial}
            animate={sheetVariants.animate}
            exit={sheetVariants.exit}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="
              fixed z-[20] overflow-y-scroll bg-[#18131FE5] px-3 py-6 pt-1 text-center
              flex flex-col items-center justify-between

              bottom-0 left-0 w-full rounded-t-2xl max-h-[90vh]

              md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              md:w-full md:max-w-md md:rounded-2xl md:max-h-[85vh]
            "
            style={{
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden ">
                <Image src={"/img/shine.svg"} alt="diamond" width={240} height={240} priority={true} />
                <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] scale-[2.5]">
                  {icon}
                </div>
              </div>

              <h3 className="text-2xl mb-2 mt-[-1.5rem] font-semibold">{title}</h3>
              <p className="text-[#B0AEB5] text-[13px] pb-1">{text}</p>

              {cost && cost > 0 && !isLevelCompleted ? (
                <div className="font-bold my-3 flex items-center">
                  Cost
                  <span className="ml-4 mr-1">
                    <DoubleCoin />
                  </span>
                  {cost}
                </div>
              ) : (
                <div className="font-bold my-3 flex items-center">
                  <DoubleCoin />
                  <span className="mx-2"> {!isLevelCompleted ? "Free" : "∞"}</span>
                  <DoubleCoin />
                </div>
              )}

              {noLevel && !isLevelCompleted ? (
                <div className="text-[#B0AEB5] text-[0.8rem]">
                  Level {level}/ {maxLevel}
                </div>
              ) : (
                <div />
              )}

              <div>{children}</div>
            </div>

            {cost <= balance ? (
              <button
                className={`btn bg-white w-[90%] text-black py-4 font-bold rounded-lg align-baseline mt-12 ${
                  !isDisabled ? "opacity-100" : "opacity-50"
                }`}
                disabled={isDisabled}
                onClick={onClick}
              >
                {!isLevelCompleted ? "Get" : "You are at the last Level"}
              </button>
            ) : (
              <button
                className={`btn bg-[#A7A7A7] w-[90%] text-black py-4 font-bold rounded-lg align-baseline mt-12 ${
                  !isDisabled ? "opacity-100" : "opacity-50"
                }`}
                disabled={isDisabled}
              >
                Insufficient Funds
              </button>
            )}

            <button
              className="absolute top-3 right-3 py-2 px-4 mt-3 cursor-pointer"
              onClick={() => {
                playClickSound();
                onClose?.();
              }}
            >
              <CloseIcon />
            </button>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};