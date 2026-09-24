import { OpenQuests } from '../soulodds/quests/OpenQuests';

export const QuestScreen = () => {
  return (
    <section>
      <div className="container mx-auto my-4 px-4 pb-32">
        <h2 className="mb-3 text-2xl font-[500]">Quests</h2>
        <p className="text-sm leading-[1.7] text-white">
          Participate in quests and earn rewards for your efforts.
        </p>
        <div className="mt-8">
          <OpenQuests />
        </div>
      </div>
    </section>
  );
};
