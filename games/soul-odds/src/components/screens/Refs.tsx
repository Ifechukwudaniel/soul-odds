import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { GameButton } from '@/components/game/GameButton';
import { RefeshInterval } from '@/constants';
import { useIsGuest } from '@/hooks/useIsGuest';
import { getUserRefers } from '@/services/data/refers';
import { User } from '@/services/db/user';
import { useAppStore } from '@/services/store/store';
import { formatAddress } from '@/utils';
import { getBaseUrl } from '@/utils/Helpers';
import { notification } from '@/utils/notifications';
import { Loader } from '../Loader';

export const InviteComponent = ({ copyInvite }: { copyInvite: () => void }) => {
  return (
    <div className="my-6 mt-8 flex h-[70%] flex-col items-center justify-center text-center">
      <p className="text-[0.8rem]">You currently have zero referrals, Damn</p>

      <div className="my-4">
        <div className="flex flex-col items-center">
          <div className="relative overflow-hidden">
            <Image src="/img/shine.svg" alt="shine" width={280} height={280} priority />

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
          Invite a Soul!
        </GameButton>
      </div>
    </div>
  );
};

export const RefsScreen: React.FC = () => {
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const address = useAppStore((state) => state.user.address);
  const isGuest = useIsGuest();

  const copyInvite = () => {
    if (!address) return;
    navigator.clipboard.writeText(`${getBaseUrl()}?ref=${address}`);
    notification.success('link copied');
  };

  const fetchReferredUsers = async () => {
    try {
      const users = await getUserRefers(address);
      setReferredUsers(users);
    } catch (error) {
      console.error('Failed to fetch referred users', error);
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
    return <Loader className="h-full" />;
  }

  const refsList = referredUsers.length > 0 ? referredUsers : [];

  return (
    <Loader className="h-full" />
  /*   <section className="flex flex-col overflow-hidden">
      <div className="container mx-auto my-4 px-4 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-3 text-2xl font-bold">Referrals</h2>
            <p className="text-[0.8rem] font-[500] text-white">Refer a friend</p>
            <p className="my-3 text-[0.8rem] text-[#AFAFAF]">{refsList.length} referrals</p>
            {isGuest && (
              <p className="mb-3 text-[0.8rem] text-[#AFAFAF]">
                You&apos;re on a guest account, so your invite link only counts while this browser
                keeps its data.
              </p>
            )}
          </div>
          <GameButton variant="papyrus" onClick={copyInvite} className="px-3 py-3 text-[13px]">
            Invite a Soul!
          </GameButton>
        </div>

        <div className="my-5 h-[1px] w-full bg-[#182334]" />
        {refsList.length === 0 ? (
          <InviteComponent copyInvite={copyInvite} />
        ) : (
          <div className="my-8 mt-1 grid gap-1">
            {refsList.map(({ address: refAddress, username: refUsername }, index) => (
              <div
                key={index}
                className="flex h-full items-center overflow-y-scroll rounded bg-[#81DBE233] px-4 py-3.5 text-[0.8rem] font-[500]"
              >
                <span className="mr-3">{index + 1}.</span>
                <Image
                  src="/img/defaultImg.png"
                  alt="default Profile Image"
                  width={20}
                  height={20}
                />
                <span className="ml-3">{refUsername || formatAddress(refAddress)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section> */
  );
};
