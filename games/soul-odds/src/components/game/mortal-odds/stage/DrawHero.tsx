import { ButtonDemo } from '@/components/assets/ButtonDemo';
import { EgyptCorner } from '@/components/assets/EgyptCorner';
import { GoldArtImage } from '@/components/assets/GoldArtImage';
import { AnubisBackdrop } from '@/components/game/AnubisBackdrop';
import { GameCard } from '@/components/game/home/GameCard';
import { HUMANS_EVER } from '@/lib/mortal-odds/config';
import { fmtNumber } from '@/lib/mortal-odds/format';
import scales from '@/public/img/scales.png';
import { serifFont } from '@/styles/serif-font';

export const DrawHero = (props: {
  currentYear: number;
  onDraw: () => void;
  drawCost: number;
  canAfford: boolean;
  insufficientFunds: boolean;
  currency: string;
}) => (
  <GameCard
    scrollable
    className="relative isolate flex flex-col items-center justify-center gap-3 py-10 text-center max-md:gap-2 max-md:py-3"
    containerClassName="flex h-full w-full flex-col"
  >
    <AnubisBackdrop />

    {/* ✦ Corner ornaments sit inside the card's edge, not outside it; one drawing, mirrored to all four corners. */}
    <EgyptCorner className="pointer-events-none absolute top-2 left-2 w-14 md:w-[72px]" />
    <EgyptCorner className="pointer-events-none absolute top-2 right-2 w-14 -scale-x-100 md:w-[72px]" />
    <EgyptCorner className="pointer-events-none absolute bottom-2 left-2 w-14 -scale-y-100 md:w-[72px]" />
    <EgyptCorner className="pointer-events-none absolute right-2 bottom-2 w-14 -scale-100 md:w-[72px]" />

    {/* ✦ scales.png is 500×500 with padding; the box is cropped to the artwork (x 19–477, y 89–414). */}
    <span className="relative block aspect-459/326 w-56 max-md:w-[124px]">
      {/* ✦ A warm glow behind the scales so they read as a lit relic, not a flat sticker. Static on purpose. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-[35%] -inset-y-[45%] -z-10 bg-[radial-gradient(closest-side,rgba(245,184,61,0.34),rgba(245,184,61,0.12)_55%,transparent)]"
      />
      <span className="absolute inset-0 overflow-hidden">
        <GoldArtImage
          src={scales}
          alt=""
          priority
          sizes="224px"
          className="absolute top-[-27.3%] left-[-4.14%] h-[153.4%] w-[108.9%]"
        />
      </span>
    </span>
    <p
      className={`${serifFont.className} max-w-full text-xl leading-snug font-bold text-balance text-white sm:text-2xl xl:text-3xl`}
    >
      Over {fmtNumber(HUMANS_EVER)} people have ever lived.
    </p>
    <p className="max-w-md text-xs leading-relaxed text-white/55">
      Anubis weighs every one of them. Read the life right and you are paid; the scales do not care
      either way.
    </p>

    <button
      type="button"
      disabled={!props.canAfford}
      onClick={props.onDraw}
      aria-label="Summon a soul"
      className="max-w-full cursor-pointer transition duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
    >
      <ButtonDemo />
    </button>
    <div className="flex w-full max-w-[340px] items-center gap-3">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#F5B83D]/50" />
      <p className="text-xs whitespace-nowrap text-white/40">
        {props.drawCost} {props.currency} stake
      </p>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#F5B83D]/50" />
    </div>
    {props.insufficientFunds && <p className="text-xs text-[#B7410E]">Not enough chips</p>}

    {/*  <p className="mt-4 max-w-sm text-xs leading-[1.5] text-[#b0aeb5] max-md:mt-1 max-md:text-[0.7rem]">
      The Duat gives up a soul in stages: an age, a land, then the life itself — each drawn at
      random from real data.
    </p> */}
  </GameCard>
);
