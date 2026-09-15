import React, { useEffect, useState } from "react";
import { CoinTap } from "../CoinTap";
import { Header } from "../Header";
import { Modal } from "../ModalBase";
import { BottleIcon } from "../assets/BottleIcon";
import { DiamondIcon } from "../assets/DiamondIcon";
import { ExtraTap } from "../touchswap/ExtraTap";
import { Refill } from "../touchswap/Refill";
import { ONE_SECOND } from "@/constants";
import { TBoost, useAppStore } from "@/services/store/store";
/* import { isSSR, initHapticFeedback, HapticFeedback } from "@tma.js/sdk-react";
 */

export const HomeScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [extraTap, setExtraTap] = useState(false);
  const [refill, setRefill] = useState(false);

  const [freeRefillBoost, setFreeRefillBoost] = useState<TBoost>();
  const [extraTapBoost, setExtraTapBoost] = useState<TBoost>();

  const extraTapActive = useAppStore(state => state.extraTap);
  const setExtraTapGlobalState = useAppStore(state => state.setExtraTap);

  const useRefill = useAppStore(state => state.useRefill);
  const energy = useAppStore(state => state.user.energy);

  const freeBoosts = useAppStore(state => state.freeBoosts);
  const setFreeBoosts = useAppStore(state => state.setFreeBoosts);

  useEffect(() => {
    const interval = setTimeout(() => {
      setExtraTapGlobalState(false);
    }, ONE_SECOND * 30);
    return () => clearTimeout(interval);
  }, [extraTapActive]);

  useEffect(() => {
    setExtraTapBoost(freeBoosts[0]);
    setFreeRefillBoost(freeBoosts[1]);
  }, [freeBoosts, freeRefillBoost, extraTapBoost]);

  const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);

  /*   useEffect(() => {
    if (typeof window !== 'undefined' && !isSSR()) {
      setHapticFeedback(initHapticFeedback());
    }
  }, []); */

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleExtraTap = () => {
    if (!extraTapBoost) return;
    if ((extraTapBoost.left || 0) < 1) return;
    hapticFeedback?.impactOccurred("rigid");
    setExtraTap(true);
    setShowModal(false);
    setExtraTapGlobalState(true);
    if (extraTapBoost) extraTapBoost.left = Math.max((extraTapBoost.left || 0) - 1, 0);
    setExtraTapBoost(extraTapBoost);
    setFreeBoosts([{ ...extraTapBoost }, freeBoosts[1]]);
  };

  const handleRefill = () => {
    if (!freeRefillBoost) return;
    if ((freeRefillBoost.left || 0) < 1) return;
    hapticFeedback?.impactOccurred("rigid");
    setRefill(true);
    setShowRefillModal(false);
    useRefill();
    if (freeRefillBoost) freeRefillBoost.left = Math.max((freeRefillBoost.left || 0) - 1, 0);
    setFreeRefillBoost(freeRefillBoost);
    setFreeBoosts([freeBoosts[0], { ...freeRefillBoost }]);
  };

  const handleExtraTapOpen = () => {
    setShowModal(true);
    hapticFeedback?.impactOccurred("medium");
  };

  const handleRefillClose = () => {
    setShowRefillModal(false);
  };

  const useRefillDisabled = energy.energyLeft === energy.maxEnergy || freeRefillBoost?.left == 0;
  const extraTapDisabled = extraTapActive || extraTapBoost?.left == 0;

  const handleRefillOpen = () => {
    setShowRefillModal(true);
    hapticFeedback?.impactOccurred("medium");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <section className="">
        <div className="h-full flex flex-col items-center justify-center">
          <CoinTap extraTap={extraTap} refill={refill} />
          <div className="w-full flex justify-between mt-10 fixed bottom-[24%]">
            <button
              className={extraTapDisabled ? "opacity-60" : "opacity-100"}
              disabled={extraTapDisabled}
              onClick={handleExtraTapOpen}
            >
              <ExtraTap total={extraTapBoost?.totalPerDay || 3} left={extraTapBoost?.left || 0} />
            </button>
            <button
              className={useRefillDisabled ? "opacity-60" : "opacity-100"}
              disabled={useRefillDisabled}
              onClick={handleRefillOpen}
            >
              <Refill total={freeRefillBoost?.totalPerDay || 3} left={freeRefillBoost?.left || 0} />
            </button>
          </div>
        </div>
        <Modal
          title="Extra Tap"
          isOpen={showModal}
          onClose={handleCloseModal}
          onClick={handleExtraTap}
          icon={<DiamondIcon />}
          cost={0}
          text={"Increases the amount of coins gained by 5x for 30 seconds. Does not consume energy while in effect."}
        />
        <Modal
          title="Daily Refill"
          isOpen={showRefillModal}
          onClose={handleRefillClose}
          onClick={handleRefill}
          icon={<BottleIcon />}
          cost={0}
          text={"Refill your energy bar quickly."}
          disabled={energy.energyLeft === energy.maxEnergy}
        />
      </section>
    </div>
  );
};
