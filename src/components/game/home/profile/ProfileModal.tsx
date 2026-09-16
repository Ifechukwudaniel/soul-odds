"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaCog, FaMedal, FaSignOutAlt, FaUser } from "react-icons/fa";
import { CloseIcon } from "@/components/assets/CloseIcon";
import { LeaderboardRankRow } from "@/components/game/home/profile/LeaderboardRankRow";
import { ProfileHeader } from "@/components/game/home/profile/ProfileHeader";
import { ProfileMenuList } from "@/components/game/home/profile/ProfileMenuList";
import type { ProfileMenuAction } from "@/components/game/home/profile/types";
import { playClickSound } from "@/utils/playClickSound";

const MENU_ICON_CLASS = "h-5 w-5 text-white/80";

export const ProfileModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  handle: string;
  rank: string;
  leaderboardRank: number;
  onViewRankPage?: () => void;
}) => {
  const menuActions: ProfileMenuAction[] = [
    { id: "edit-icon", label: "Edit Profile Icon", icon: <FaUser className={MENU_ICON_CLASS} /> },
    {
      id: "rank-page",
      label: "View Rank Page",
      icon: <FaMedal className={MENU_ICON_CLASS} />,
      onClick: () => {
        props.onViewRankPage?.();
        props.onClose();
      },
    },
    { id: "settings", label: "Settings", icon: <FaCog className={MENU_ICON_CLASS} /> },
    { id: "log-out", label: "Log Out", icon: <FaSignOutAlt className={MENU_ICON_CLASS} /> },
  ];

  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
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
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-md flex-col gap-5 rounded-3xl  bg-[#18131FE5] p-6"
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

            <ProfileHeader username={props.username} handle={props.handle} rank={props.rank} />
            <LeaderboardRankRow rank={props.leaderboardRank} />
            <hr className="border-white/10" />
            <ProfileMenuList actions={menuActions} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
