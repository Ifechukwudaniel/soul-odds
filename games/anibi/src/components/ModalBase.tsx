import React from "react";
import Image from "next/image";
import { CloseIcon } from "./assets/CloseIcon";
import { DoubleCoin } from "./assets/DoubleCoin";
import { useAppStore } from "@/services/store/store";
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
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed z-[20]  overflow-y-scroll bottom-0 w-full bg-[#18131FE5] px-3 py-6 pt-1 text-center flex flex-col items-center justify-between  left-0 rounded-t-2xl"
            style={{
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
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
                className={`btn bg-white w-full text-black py-4 font-bold rounded-lg align-baseline mt-12 ${
                  !isDisabled ? "opacity-100" : "opacity-50"
                }`}
                disabled={isDisabled}
                onClick={onClick}
              >
                {!isLevelCompleted ? "Get" : "You are at the last Level"}
              </button>
            ) : (
              <button
                className={`btn bg-[#A7A7A7] w-full text-black py-4 font-bold rounded-lg align-baseline mt-12 ${
                  !isDisabled ? "opacity-100" : "opacity-50"
                }`}
                disabled={isDisabled}
              >
                Insufficient Funds
              </button>
            )}

            <button className="absolute top-3 right-3 py-2 px-4 mt-3" onClick={onClose}>
              <CloseIcon />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
