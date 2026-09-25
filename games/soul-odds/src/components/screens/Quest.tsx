import { OpenQuests } from '../soulodds/quests/OpenQuests';

export const QuestScreen = () => {
  return (
    <section>
      <div className="container mx-auto my-4 px-4 pb-32 max-md:pb-4">
        <h2 className="mb-3 text-2xl font-[500] max-md:text-xl">Quests</h2>
        <p className="text-sm leading-[1.7] text-white max-md:text-[0.8rem] max-md:leading-[1.5] max-md:text-white/70">
          Participate in quests and earn rewards for your efforts.
        </p>
        <div className="mt-8">
          <OpenQuests />
        </div>
      </div>
    </section>
  );
};
