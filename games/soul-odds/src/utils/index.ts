import { QuestList } from '@/types';

export const checkIfMoreThanADay = (date: Date) => {
  if (!date) return false;
  const now = new Date();
  const lastDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 1;
};

export const secondsDiffrence = (date: Date, target: number) => {
  if (!date) return false;
  const lastDate = new Date(date);
  const now = new Date();
  const seconds = ((now.getTime() - lastDate.getTime()) / 1000) as number;
  return seconds > target;
};

export const getPreviousDay = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

export const calculateTotalReward = (quest: QuestList) => {
  let totalReward = 0;
  for (const task of quest.tasks) {
    totalReward += task.reward ?? 0;
  }
  return totalReward;
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Shortens a wallet address to a leading and trailing slice for display.
 * @param address The full address.
 * @returns The address unchanged if it's already short, otherwise `0x1234…6789`.
 */
export function formatAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
