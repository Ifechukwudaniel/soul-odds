import { useAppStore } from '@/services/store/store';
import { QuestList } from '@/types';
import { calculateTotalReward } from '@/utils';
import { OpenQuestDetailScreen } from './OpenQuestDetails';

export const connectQuestsLists: QuestList = {
  id: 'wallet',
  title: 'Wallet Connect Fun',
  desc: 'Connect Soul Odds to your ton wallet, be careful! Once connected, any rewards would be sent to the connected wallet.',
  tasks: [
    {
      title: 'Connect Wallet',
      completed: false,
      link: '',
      reward: 10000,
    },
  ],
  claimed: false,
};

export const ConnectQuestScreen = () => {
  const walletClaimed = useAppStore((state) => state.walletClaimed);

  const totalReward = calculateTotalReward(connectQuestsLists);
  const handleClaim = async () => false;

  const handleTaskOpen = (index: number) => {
    console.log(index);
  };

  return (
    <OpenQuestDetailScreen
      quest={connectQuestsLists}
      handleClaim={handleClaim}
      handleTaskOpen={handleTaskOpen}
      reward={totalReward}
      claimed={walletClaimed}
      walletTask={true}
    />
  );
};
