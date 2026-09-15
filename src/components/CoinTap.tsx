import React, { useEffect, useMemo, useState } from "react";
import { Balance } from "./Balance";
import { BgGlow } from "./assets/BgGlow";
import { BgGlowGreen } from "./assets/BgGlowGreen";
import { BgGlowPurple } from "./assets/BgGlowPurple";
import { ONE_SECOND } from "@/constants";
import { socketInstance } from "@/services/socket";
import { useAppStore } from "@/services/store/store";
/* import { HapticFeedback, initHapticFeedback, isSSR, retrieveLaunchParams } from "@tma.js/sdk-react";
 */
type TapPosition = {
  key: number;
  x: number;
  y: number;
};

const frames = ["/img/coin.png", "/img/coin.png"];

export const CoinTap = ({ extraTap, refill }: { extraTap: boolean; refill: boolean }) => {
  const user = useAppStore(state => state.user);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [tapPositions, setTapPositions] = useState<TapPosition[]>([]);
  const [tapCounter, setTapCounter] = useState(0);
  const balance = useAppStore(state => state.user!.balance);
  const energyLeft = useAppStore(state => state.user!.energy.energyLeft);
  const extraTapActive = useAppStore(state => state.extraTap);
  const tapValue = useAppStore(state => state.user!.tapValue);
  const autoClick = useAppStore(state => state.autoClick);
  const updateBalance = useAppStore(state => state.updateBalance);
  const useEnergy = useAppStore(state => state.useEnergy);
  const deActivateAutoClick = useAppStore(state => state.deActivateAutoClick);
  const latestState = useAppStore(state => state);

  const [rotation, setRotation] = useState(0);
  const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);

  /*   useEffect(() => {
    if (typeof window !== "undefined" && !isSSR()) {
      setHapticFeedback(initHapticFeedback());
    }
  }, []); */

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClick == null) return;
      if (autoClick.startedOn) {
        console.log(autoClick.startedOn);
        const currentTime = new Date().getTime();
        const hoursDifference = Math.floor(Math.abs(currentTime - new Date(autoClick.startedOn).getTime()) / 3600000);
        if (hoursDifference < 12) {
          touchCoin();
        } else deActivateAutoClick();
      }
    }, ONE_SECOND / 3);

    return () => clearInterval(interval);
  }, [autoClick]);

  const coinClick = (id: number) => {
    const data = JSON.stringify({
      id: id,
      user: latestState.user,
      freeBoosts: latestState.freeBoosts,
      paidBoosts: latestState.paidBoosts,
      extraTap: latestState.extraTap,
      autoClick: latestState.autoClick,
      rechargeSpeed: latestState.rechargeSpeed,
    });
    socketInstance.emit("state-update", data);
  };

  const handleCoinTap = (e: any) => {
    if (!user) return;
    if (energyLeft < 1) return;
    if (typeof window !== "undefined") hapticFeedback?.impactOccurred("heavy");
    setCurrentFrame(prevFrame => (prevFrame + 1) % frames.length);
    setRotation(prevRotation => prevRotation - 105);
    const touches = e.touches;
    const newTaps: TapPosition[] = [];

    for (let i = 0; i < touches.length; i++) {
      const { clientX, clientY } = touches[i];
      const targetRect = (e.target as HTMLElement).getBoundingClientRect();
      const offsetX = clientX - targetRect.left;
      const offsetY = clientY - targetRect.top;
      newTaps.push({ key: tapCounter + i, x: offsetX, y: offsetY });
      console.log(offsetX, offsetY);
    }

    setTapPositions([...tapPositions, ...newTaps]);
    setTapCounter(tapCounter + touches.length);

    const totalTapValue = tapValue * touches.length;
    updateBalance(balance + totalTapValue);
    useEnergy(tapValue);
    coinClick(user!.id);
  };

  const handleAnimationEnd = (key: number) => {
    setTapPositions(tapPositions.filter(tap => tap.key !== key));
  };

  const touchCoin = () => {
    const coinImg = document.getElementById("coinImage");
    if (coinImg) {
      const touchEvent = new TouchEvent("touchstart", {
        touches: [
          new Touch({
            identifier: 0,
            target: coinImg,
            clientX: coinImg.getBoundingClientRect().left,
            clientY: coinImg.getBoundingClientRect().top,
          }),
        ],
        bubbles: true,
        cancelable: true,
      });

      // Dispatch the touch event on the image element
      coinImg.dispatchEvent(touchEvent);
      //alert(coinImg !== null);
    } else {
      console.error("Element not found");
    }
  };

  return (
    <>
      <Balance count={balance} />
      <div className="relative mt-5 flex items-center justify-center  rounded-full">
        <button className="relative flex items-center justify-center h-[285px] w-[285px] rounded-full coin-img">
          <img
            src={frames[0]}
            alt={`Frame `}
            className="coin-img w-full  z-20 rounded-full absolute top-0 bottom-0 left-0 right-0"
            style={{
              transition: "all 0.3s ease-in-out",
              rotate: `${rotation}deg`,
            }}
          />
          <img
            src={frames[0]}
            alt={`Frame `}
            id="coinImage"
            className="coin-img  w-full  z-20 rounded-full opacity-0"
            onTouchStart={handleCoinTap}
            style={{
              transition: "all 0.3s ease-in-out",
            }}
          />

          {tapPositions.map(({ key, x, y }) => (
            <span
              key={key}
              className="absolute text-white text-[1.5rem] z-30 font-semibold"
              style={{
                top: `${y - 5}px`,
                left: x,
                animation: "numberAnimation 1.5s forwards ease-out",
              }}
              onAnimationEnd={() => handleAnimationEnd(key)}
            >
              +{tapValue}
            </span>
          ))}
        </button>

        <div className="absolute left-0 right-0 bottom-0 overflow-visible top-[-30%] ">
          <BgGlow
            className={`${
              extraTapActive ? "opacity-0" : "opacity-100"
            }  w-full z-[-1]  scale-[1.4] transition-opacity duration-500 ease-in-out`}
          />
        </div>

        {/*        <div className="absolute right-0 top-[-70%]  left-0 bottom-0 z-[-1]  overflow-visible  ">
          <BgGlowGreen
            className={`${
              extraTapActive ? "opacity-100" : "opacity-0"
            } scale-[1.7] transition-opacity duration-500 ease-in-out`}
          />
        </div>

        <div className="absolute right-0  left-0  bottom-0  top-[-70%] z-[-1]">
          <BgGlowPurple
            className={`${
              refill ? "opacity-100" : "opacity-0"
            }   overflow-visible scale-[1.7] transition-opacity duration-500 ease-in-out`}
          />
        </div> */}
      </div>
    </>
  );
};
