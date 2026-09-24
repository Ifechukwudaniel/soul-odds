import type { IconType } from 'react-icons';
import { serifFont } from '@/styles/serif-font';

export const RevealSection = (props: {
  icon: IconType;
  title: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={`mystic-glass flex flex-col gap-3 rounded-2xl p-8 px-6 ${props.className ?? ''}`}
  >
    <h4
      className={`${serifFont.className} flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-[#F3D38F] uppercase`}
    >
      <props.icon size={20} className="text-[#F5B83D]" />
      {props.title}
    </h4>
    {props.children}
  </section>
);
