import React, {  useEffect, useState } from "react";
import Image from "next/image";
import { Loader } from "../Loader";
import { GameButton } from "@/components/game/GameButton";
import {  RefeshInterval } from "@/constants";
import { useIsGuest } from "@/hooks/useIsGuest";
import { getUserRefers } from "@/services/data/refers";
import { User } from "@/services/db/user";
import { useAppStore } from "@/services/store/store";
import { formatAddress } from "@/utils";
import { getBaseUrl } from "@/utils/Helpers";
import { notification } from "@/utils/notifications";

export const InviteComponent = ({ copyInvite }: { copyInvite: () => void }) => {
  return (
    <div className="flex flex-col text-center items-center my-6 h-[70%] justify-center mt-8">
    <p className="text-[0.8rem]">
      You currently have zero referrals, Damn
    </p>

    <div className="my-4">
      <div className="flex flex-col items-center">
        <div className="relative overflow-hidden">
          <Image
            src="/img/shine.svg"
            alt="shine"
            width={280}
            height={280}
            priority
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2.5]">
          <Image
                src="/egypt/Relics/sand_relics_treasure_chest_gold_01.png"
                alt="referral icon"
                width={50}
                height={50}
                unoptimized
              />
          </div>
        </div>
      </div>
      <GameButton variant="papyrus" onClick={copyInvite} className="w-full py-4 text-base">
        Invite a Friend!
      </GameButton>
    </div>
  </div>
  );
};

export const RefsScreen: React.FC = () => {
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const address = useAppStore(state => state.user.address);
  const isGuest = useIsGuest();


  const copyInvite = () => {
    if (!address) return;
    navigator.clipboard.writeText(`${getBaseUrl()}?ref=${address}`);
    notification.success("link copied");
  };

  const fetchReferredUsers = async () => {
    try {
      const users = await getUserRefers(address);
      setReferredUsers(users);
    } catch (error) {
      console.error("Failed to fetch referred users", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    if (!address) return;
    fetchReferredUsers();
    const interval = setInterval(fetchReferredUsers, RefeshInterval);
    return () => clearInterval(interval);
  }, [address]);

  if (loading) {
    return (
      <section className="flex flex-col h-screen justify-center items-center">
        <Loader />
      </section>
    );
  }

  const refsList = referredUsers.length > 0 ? referredUsers : [];

  return (
    <section className="flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 my-4 pb-16">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-3">Referrals</h2>
            <p className="text-[0.8rem] text-white font-[500]">Refer a friend</p>
            <p className="text-[#AFAFAF] text-[0.8rem] my-3">{refsList.length} referrals</p>
            {isGuest && (
              <p className="text-[#AFAFAF] text-[0.8rem] mb-3">
                You&apos;re on a guest account, so your invite link only counts while this browser keeps its data.
              </p>
            )}
          </div>
          <GameButton variant="papyrus" onClick={copyInvite} className="px-3 py-3 text-[13px]">
            Invite a Friend!
          </GameButton>
        </div>

        <div className="bg-[#182334] h-[1px] w-full my-5" />
        {refsList.length === 0 ? (
          <InviteComponent copyInvite={copyInvite} />
        ) : (
          <div className="grid gap-1 my-8 mt-1">
            {refsList.map(({ address: refAddress, username: refUsername }, index) => (
              <div
                key={index}
                className="bg-[#81DBE233] py-3.5 px-4 rounded text-[0.8rem] font-[500] flex items-center overflow-y-scroll h-full"
              >
                <span className="mr-3">{index + 1}.</span>
                <Image src="/img/defaultImg.png" alt="default Profile Image" width={20} height={20} />
                <span className="ml-3">{refUsername || formatAddress(refAddress)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
