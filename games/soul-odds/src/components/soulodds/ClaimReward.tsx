import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import Fireworks from 'react-canvas-confetti/dist/presets/fireworks';
import { playClickSound } from '@/utils/playClickSound';
import { CloseIcon } from '../assets/CloseIcon';
import { CongratsIcon } from '../assets/CongratsIcon';
import { Balance } from '../Balance';

type ModalProps = {
  onClose?: () => void;
  isOpen: boolean;
  reward: number | string;
};

export const ClaimReward: React.FC<ModalProps> = ({ onClose, isOpen, reward }) => {
  const handleClose = () => {
    playClickSound();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key={'fff'}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{
              y: 0,
            }}
            exit={{
              y: '100%',
            }}
            transition={{ type: 'spring', bounce: 0, duration: 0.7 }}
            className="fixed bottom-0 left-0 z-[50] flex h-[100%] w-full flex-col overflow-y-scroll bg-[#18131FE5] px-3 py-6 text-center"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <div className="my-6 mt-16 flex h-full flex-col items-center justify-center text-center">
              <div>
                <Fireworks autorun={{ speed: 1 }} />
                <CongratsIcon />
              </div>
              <div className="mt-1 mb-10 flex flex-col items-center">
                <p className="mb-1 font-bold">Reward claimed</p>
                {typeof reward === 'number' ? (
                  <Balance count={reward} size="xl" />
                ) : (
                  <p className="text-xl font-[600]">{reward}</p>
                )}
              </div>

              <button
                className="btn w-full rounded-lg bg-white py-4 align-baseline font-[700] text-black"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
            <button className="absolute top-3 right-3 mt-3 px-4 py-2" onClick={handleClose}>
              <CloseIcon />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
