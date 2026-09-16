/** Shared card frame matching the existing booster card theme (dark-blue-gradient border, light-green-gradient body). */
export const GameCard = (props: { children: React.ReactNode; className?: string; containerClassName?: string }) => (
  <div className={`dark-blue-gradient rounded-lg border-[0.5px] border-[#49485C] p-1 ${props.containerClassName ?? ""}`}>
    <div className={`light-green-gradient rounded p-4 ${props.className ?? ""}`}>{props.children}</div>
  </div>
);
