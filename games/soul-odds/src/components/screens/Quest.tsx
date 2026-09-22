import { OpenQuests } from "../touchswap/quests/OpenQuests";

export const QuestScreen = () => {
  return (
    <section>
      <div className="container mx-auto px-4 my-4 pb-32">
        <h2 className="text-2xl font-[500] mb-3">Quests</h2>
        <p className="text-sm text-white leading-[1.7]">Participate in quests and earn rewards for your efforts.</p>
        <div className="mt-8">
          <OpenQuests />
        </div>
      </div>
    </section>
  );
};
