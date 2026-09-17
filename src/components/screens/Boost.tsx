import React from "react";
import { Balance } from "../Balance";
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
};

export const boostCardLists: BoostCardList[] = [
  {
    title: "Hieroglyphs",
    desc: "Increases the speed at which your energy regenerates by +1 every second.",
    icon: <RelicIcon relic="scarab" size={40} />,
    initalCost: 250,
    id: 3,
    noLevel: true,
  },
  {
    title: "Golden mask",
    desc: "Increases the amount gained +5",
    icon: <RelicIcon relic="mask" size={40} />,
    initalCost: 500,
    id: 4,
    noLevel: true,
  },
  {
    title: "Obelisk",
    desc: "Increases the speed at which your energy regenerates by +1 every second.",
    icon: <RelicIcon relic="obelisk" size={40} />,
    initalCost: 250,
    id: 5,
    noLevel: true,
  },
  {
    title: "Treasure chest",
    desc: "Perform actions on your behalf without your direct input when your energy is full. Works for 12 hours.",
    icon: <RelicIcon relic="chest" size={40} />,
    initalCost: 200000,
    id: 6,
    noLevel: false,
  },
];

export const BoostScreen = () => {
  const balance = useAppStore(state => state.user!.balance);

  return (
    <section className="flex flex-col h-screen">
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
          Use these powerups to increase your ranking and the amount of coins you gain!
        </p>
        <div className="bg-[#182334] h-[1px] w-full my-4" />
        <div className="mt-1">
          <h3 className="text-sm mb-2 font-[500]">Balance</h3>
          <Balance count={balance} />
          <div className="grid grid-cols-2 gap-4 gap-x-[10px] my-6 overflow-y-scroll pb-32 max-h-full h-[100%]">
            {boostCardLists.map(({ id, title, icon, desc, initalCost, noLevel }, index) => (
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
