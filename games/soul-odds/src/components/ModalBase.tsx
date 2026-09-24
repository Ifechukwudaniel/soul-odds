import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/services/store/store';
import { playClickSound } from '@/utils/playClickSound';
import { CloseIcon } from './assets/CloseIcon';
import { DoubleCoin } from './assets/DoubleCoin';

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
  /** Real-money fallback shown when the player can't afford `cost` in soft currency. */
  onBuyWithTokens?: () => void;
};

const useIsDesktop = (breakpoint = 768) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
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
  onBuyWithTokens,
}) => {
  const balance = useAppStore((state) => state.user!.balance);
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
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
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
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 z-[20] flex max-h-[90vh] w-full flex-col items-center justify-between overflow-y-scroll rounded-t-2xl bg-[#18131FE5] px-3 py-6 pt-1 text-center md:top-1/2 md:bottom-auto md:left-1/2 md:max-h-[85vh] md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <div className="relative overflow-hidden">
                <Image
                  src={'/img/shine.svg'}
                  alt="diamond"
                  width={240}
                  height={240}
                  priority={true}
                />
                <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] scale-[2.5]">
                  {icon}
                </div>
              </div>

              <h3 className="mt-[-1.5rem] mb-2 text-2xl font-semibold">{title}</h3>
              <p className="pb-1 text-[13px] text-[#B0AEB5]">{text}</p>

              {cost && cost > 0 && !isLevelCompleted ? (
                <div className="my-3 flex items-center font-bold">
                  Cost
                  <span className="mr-1 ml-4">
                    <DoubleCoin />
                  </span>
                  {cost}
                </div>
              ) : (
                <div className="my-3 flex items-center font-bold">
                  <DoubleCoin />
                  <span className="mx-2"> {!isLevelCompleted ? 'Free' : '∞'}</span>
                  <DoubleCoin />
                </div>
              )}

              {noLevel && !isLevelCompleted ? (
                <div className="text-[0.8rem] text-[#B0AEB5]">
                  Level {level}/ {maxLevel}
                </div>
              ) : (
                <div />
              )}

              <div>{children}</div>
            </div>

            {cost <= balance ? (
              <button
                className={`btn mt-12 w-[90%] rounded-lg bg-white py-4 align-baseline font-bold text-black ${
                  !isDisabled ? 'opacity-100' : 'opacity-50'
                }`}
                disabled={isDisabled}
                onClick={onClick}
              >
                {!isLevelCompleted ? 'Get' : 'You are at the last Level'}
              </button>
            ) : onBuyWithTokens ? (
              <button
                className={`btn mt-12 w-[90%] rounded-lg bg-white py-4 align-baseline font-bold text-black ${
                  !isDisabled ? 'opacity-100' : 'opacity-50'
                }`}
                disabled={isDisabled}
                onClick={onBuyWithTokens}
              >
                Buy with tokens
              </button>
            ) : (
              <button
                className={`btn mt-12 w-[90%] rounded-lg bg-[#A7A7A7] py-4 align-baseline font-bold text-black ${
                  !isDisabled ? 'opacity-100' : 'opacity-50'
                }`}
                disabled={isDisabled}
              >
                Insufficient Funds
              </button>
            )}

            <button
              className="absolute top-3 right-3 mt-3 cursor-pointer px-4 py-2"
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
