import { GiEyeOfHorus } from 'react-icons/gi';
import { LuSparkle } from 'react-icons/lu';
import { fmtYear } from '@/lib/mortal-odds/format';
import { serifFont } from '@/styles/serif-font';

const YearStamp = (props: { year: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className={`${serifFont.className} text-xl font-bold text-[#F3D38F]`}>
      {fmtYear(props.year)}
    </span>
    <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase">{props.label}</span>
  </div>
);

export const RevealHeader = (props: {
  fate: string;
  placeName: string;
  bornYear: number;
  deathYear: number;
  epitaph: string;
  alive: boolean;
}) => (
  <header className="flex flex-col items-center gap-1 px-2 py-3 text-center">
    <div className="flex w-full max-w-md items-center gap-3">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#F5B83D]/60" />
      <GiEyeOfHorus size={34} className="text-[#F5B83D]" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#F5B83D]/60" />
    </div>

    <h3 className={`${serifFont.className} mt-1 text-2xl font-bold text-white sm:text-3xl`}>
      {props.fate}
    </h3>
    <p className="text-sm text-white/80">Born in {props.placeName}</p>

    <div className="mt-2 flex items-center gap-6">
      <YearStamp year={props.bornYear} label="Born" />
      <LuSparkle className="text-[#F5B83D]" />
      <YearStamp year={props.deathYear} label={props.alive ? 'Projected' : 'Died'} />
    </div>

    <p className="mt-1 text-sm text-white/70 italic">{props.epitaph}</p>
  </header>
);
