import { QuestCard } from './QuestCard';

type OpenQuestsList = {
  title: string;
  page: string;
  reward: string;
};

export const openQuestsLists: OpenQuestsList[] = [
  {
    title: 'Social Media Madness!',
    page: 'social',
    reward: '1 free redraw',
  },
];

export const OpenQuests = () => {
  return (
    <div className="grid gap-4">
      {openQuestsLists.map(({ title, page, reward }, index) => {
        return <QuestCard title={title} key={index} page={page} reward={reward} />;
      })}
    </div>
  );
};
