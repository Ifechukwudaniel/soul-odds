import { Scroller } from '@/components/Scroller';

/** Framed card. With `scrollable`, the inner card scrolls with the themed scrollbar and `className` styles the content. */
export const GameCard = (props: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  scrollable?: boolean;
}) => (
  <div
    className={`dark-blue-gradient rounded-lg border-[0.5px] border-[#49485C] p-1 ${props.containerClassName ?? ''}`}
  >
    {props.scrollable ? (
      <div className="light-green-gradient min-h-0 flex-1 overflow-hidden rounded">
        <Scroller className="h-full [--os-gutter:44px] [--os-inset-x:8px] [--os-inset-y:10px]">
          <div className={`min-h-full p-4 max-md:p-3 ${props.className ?? ''}`}>{props.children}</div>
        </Scroller>
      </div>
    ) : (
      <div className={`light-green-gradient rounded p-4 max-md:p-3 ${props.className ?? ''}`}>
        {props.children}
      </div>
    )}
  </div>
);
