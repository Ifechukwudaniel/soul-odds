'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CardCorner } from '@/components/assets/CardCorner';
import { CloseIcon } from '@/components/assets/CloseIcon';
import { ProfilePanelBody } from '@/components/game/home/profile/ProfilePanelBody';
import { useAppStore } from '@/services/store/store';
import { playClickSound } from '@/utils/playClickSound';

export const ProfileModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  handle: string;
  rank: string;
  onViewRankPage?: () => void;
}) => {
  const avatarId = useAppStore((state) => state.user.avatarId);

  const goToRankPage = () => {
    props.onViewRankPage?.();
    props.onClose();
  };

  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
          key="profile-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4"
          onClick={() => {
            playClickSound();
            props.onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            onClick={(event) => event.stopPropagation()}
            className="game-modal-panel relative flex w-full max-w-md flex-col gap-5 rounded-2xl rounded-tl-md rounded-br-md p-6"
          >
            {/* ✦ Same corner frame as the round record: nudged out by the art's own empty margin so its lines sit flush on the border. */}
            <CardCorner className="pointer-events-none absolute top-0 left-0 h-auto w-14 -translate-x-[2.469%] -translate-y-[1.656%] rotate-180 md:w-[72px]" />
            <CardCorner className="pointer-events-none absolute right-0 bottom-0 h-auto w-14 translate-x-[2.469%] translate-y-[1.656%] md:w-[72px]" />

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

            <ProfilePanelBody
              username={props.username}
              handle={props.handle}
              rank={props.rank}
              avatarId={avatarId}
              onViewRankPage={goToRankPage}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
