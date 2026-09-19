type QuestTabProps = {
  activeTab: number;
  setActiveTab: (tab: number) => void;
};

export const QuestTab = ({ activeTab, setActiveTab }: QuestTabProps) => {
  return (
    <div role="tablist" className="tabs space-x-6 flex mb-6 text-sm border-b-[0.5px] border-[#293641]">
      <a
        role="tab"
        className={`${activeTab === 0 ? "tab-active text-white" : "text-[#AFAFAF]"}  pb-2`}
        onClick={() => setActiveTab(0)}
      >
        <span>Open Quests</span>
      </a>
      <a
        role="tab"
        className={` ${activeTab === 1 ? "tab-active text-white" : "text-[#AFAFAF]"}`}
        onClick={() => setActiveTab(1)}
      >
        <span>Referral Quests</span>
      </a>
    </div>
  );
};
