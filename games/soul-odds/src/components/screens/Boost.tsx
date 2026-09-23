import React from "react";
import { RelicIcon } from "../assets/RelicIcon";
import { BoostCard } from "../touchswap/BoostCard";
import { useAppStore } from "@/services/store/store";
import { motion } from "framer-motion";

type BoostCardList = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
  initalCost: number;
  id: number;
  level?: number;
  maxLevel?: number;
  noLevel: boolean;
  /** Not shown on the Boost screen yet — keeps a boost in the lineup without committing to it publicly. */
  hidden?: boolean;
};

export const boostCardLists: BoostCardList[] = [
  {
    title: "Soul's Rest",
    desc: "Redraws cost less the more you level this up, down to a floor that never quite reaches free.",
    icon: <RelicIcon relic="sarcophagus" size={40} />,
    initalCost: 10000,
    id: 1,
    noLevel: false,
  },
  {
    title: "Divine Luck",
    desc: "Increases your payout by 1% per level.",
    icon: <RelicIcon relic="obelisk" size={40} />,
    initalCost: 10000,
    id: 2,
    noLevel: false,
  },
  {
    title: "Pharaoh's Fortune",
    desc: "Activate a blessing: for a limited time, landing a perfect round pays double.",
    icon: <RelicIcon relic="chest" size={40} />,
    initalCost: 200000,
    id: 3,
    noLevel: true,
  },
  {
    title: "Oracle's Whisper",
    desc: "Reveals how likely each outcome is before you lock in your bets.",
    icon: <RelicIcon relic="scarab" size={40} />,
    initalCost: 50000,
    id: 4,
    noLevel: true,
    hidden: false,
  },
];

export const BoostScreen = () => {
  const balance = useAppStore(state => state.user!.balance);

  return (
    <section className="flex flex-col lg:h-[80vh]">
      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.55,
        }}
        className="container mx-auto px-4 my-4"
      >
        <h2 className="text-2xl font-[500] mb-3">Boosters</h2>
        <p className="text-sm sf-pro-medium">
           Enhance your draws, judgments, and rewards with ancient powers.
        </p>
        <div className="bg-[#182334] h-[1px] w-full my-4" />
        <div className="mt-1">
          <div className="grid grid-cols-2 gap-4 gap-x-[10px] my-6 overflow-y-scroll pb-32 max-h-full h-[100%]">
            {boostCardLists.filter(({ hidden }) => !hidden).map(({ id, title, icon, desc, initalCost, noLevel }, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <BoostCard
                  initialCost={initalCost}
                  title={title}
                  key={title}
                  icon={icon}
                  desc={desc}
                  id={id}
                  noLevel={noLevel}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
