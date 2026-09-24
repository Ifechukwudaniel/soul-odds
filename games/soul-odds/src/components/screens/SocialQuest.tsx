import { useEffect, useState } from 'react';
import { SOCIAL_TASKS } from '@/lib/social-quests';
import { claimSocialReward, getUserTasks, postUserTasks } from '@/services/data/task';
import { getUser } from '@/services/data/user';
import { useAppStore } from '@/services/store/store';
import type { QuestList, UserTask } from '@/types';
import { notification } from '@/utils/notifications';
import { Loader } from '../Loader';
import { OpenQuestDetailScreen } from './OpenQuestDetails';

const initialTasks: UserTask[] = SOCIAL_TASKS.map((task) => ({ ...task, completed: false }));

export const SocialQuestScreen = () => {
  const address = useAppStore((state) => state.user.address);
  const updateUser = useAppStore((state) => state.updateUser);
  const [tasks, setTasks] = useState(initialTasks);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userTasks, user] = await Promise.all([getUserTasks(address), getUser(address)]);
        setTasks(userTasks);
        setClaimed(user.socialClaimed);
      } catch (error) {
        console.error('Error fetching user tasks:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [address]);

  const quest: QuestList = {
    id: 'social',
    title: 'Social Media Madness!',
    desc: 'Follow us on X and join our Discord to earn 1 free redraw.',
    tasks,
    claimed,
  };

  const handleTaskOpen = (index: number) => {
    const task = tasks[index];
    if (!task) return;
    window.open(task.link, '_blank', 'noopener,noreferrer');
    setTasks(tasks.map((item) => (item.id === task.id ? { ...item, completed: true } : item)));
    postUserTasks(address, task.id).catch((error) => console.error('Could not save task:', error));
  };

  const handleClaim = async () => {
    try {
      const result = await claimSocialReward(address);
      updateUser({ freeRedraws: result.freeRedraws });
      setClaimed(true);
      return true;
    } catch {
      notification.error('Reward unavailable');
      return false;
    }
  };

  if (loading) {
    return <Loader className="h-full" />;
  }

  return (
    <OpenQuestDetailScreen
      quest={quest}
      handleClaim={handleClaim}
      handleTaskOpen={handleTaskOpen}
      claimed={claimed}
      reward="1 free redraw"
      walletTask={false}
    />
  );
};
