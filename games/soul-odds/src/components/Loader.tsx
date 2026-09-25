'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef } from 'react';
import { GiScales } from 'react-icons/gi';
import backdrop from '@/public/img/annibals.png';
import logo from '@/public/img/logo-gold.png';
import { serifFont } from '@/styles/serif-font';

gsap.registerPlugin(useGSAP);

const LORE_LINES = [
  "Anubis weighs your fate upon the scales of Ma'at…",
  'The jackal reads the ledger of souls…',
  'Gold is counted in the hall of judgment…',
  'The odds are inscribed upon the papyrus…',
];

const LORE_HOLD_S = 2.2;
const HINT_DELAY_S = 8;


const MIN_VISIBLE_MS = 900;
const EXIT_DURATION_S = 0.5;

export const Loader = (props: {
  className?: string;
  label?: string;
  hint?: string;
  ready?: boolean;
  onExit?: () => void;
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const loreRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const mountedAtRef = useRef(Date.now());

  useGSAP(() => {
    const intro = introRef.current;
    const scale = scaleRef.current;
    const fill = fillRef.current;
    const lore = loreRef.current;
    const hint = hintRef.current;
    if (!intro || !scale || !fill || !lore) return;

    let loreIndex = 0;
    const cycleLore = () => {
      loreIndex = (loreIndex + 1) % LORE_LINES.length;
      lore.textContent = LORE_LINES[loreIndex] ?? '';
    };

    const motion = gsap.matchMedia();
    motion.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        full: '(prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };

        if (reduced) {
          gsap.set(intro, { opacity: 1 });
          gsap.set(fill, { width: '75%' });
          if (hint) gsap.set(hint, { opacity: 1 });
          const ticker = gsap
            .timeline({ repeat: -1 })
            .call(cycleLore, undefined, `+=${LORE_HOLD_S}`);
          return () => {
            ticker.kill();
          };
        }

        gsap
          .timeline()
          .from(intro, { opacity: 0, y: -8, duration: 0.6, ease: 'power2.out' })
          .from(scale, { opacity: 0, scale: 0.85, duration: 0.6, ease: 'back.out(1.6)' }, '<0.1');

        const sway = gsap.to(scale, {
          rotate: 5,
          duration: 1.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          transformOrigin: '50% 20%',
        });

        const trickle = gsap
          .timeline()
          .to(fill, { width: '82%', duration: 3.5, ease: 'power2.out' })
          .to(fill, { width: '90%', duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        const ticker = gsap
          .timeline({ repeat: -1 })
          .to(lore, { opacity: 0, duration: 0.35, delay: LORE_HOLD_S })
          .call(cycleLore)
          .to(lore, { opacity: 1, duration: 0.35 });

        if (hint) {
          gsap.to(hint, { opacity: 1, duration: 0.8, delay: HINT_DELAY_S, ease: 'power1.out' });
        }

        return () => {
          sway.kill();
          trickle.kill();
          ticker.kill();
        };
      },
    );

    return () => motion.revert();
  });

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !props.ready || !props.onExit) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const remainingS = Math.max(0, MIN_VISIBLE_MS - (Date.now() - mountedAtRef.current)) / 1000;
      const onExit = props.onExit;

      const exit = gsap.to(root, {
        opacity: 0,
        scale: reduced ? 1 : 1.02,
        duration: reduced ? 0.2 : EXIT_DURATION_S,
        ease: 'power2.inOut',
        delay: remainingS,
        onComplete: onExit,
      });

      return () => {
        exit.kill();
      };
    },
    { dependencies: [props.ready] },
  );

  return (
    <div
      ref={rootRef}
      className={`relative flex ${props.className ?? 'h-screen'} w-full flex-col items-center justify-center overflow-hidden bg-[#0b0a08]`}
    >
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30"
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: "url('/img/stars.svg')", backgroundRepeat: 'repeat' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a08]/40 via-[#0b0a08]/75 to-[#0b0a08]" />

      <div ref={introRef} className="-translate-y-6  relative z-10 flex flex-col items-center gap-4 px-6">
        <Image
          src={logo}
          alt="Soul Odds"
          width={200}
          height={67}
          priority
        />

        <div ref={scaleRef} className="relative flex items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full bg-[#f5b83d]/20 blur-2xl" />
          <svg width="0" height="0" className="absolute">
  <defs>
    <linearGradient
      id="gold-gradient"
      x1="0%"
      y1="0%"
      x2="0%"
      y2="100%"
    >
      <stop offset="0%" stopColor="#FFF4B0" />
      <stop offset="25%" stopColor="#FFD966" />
      <stop offset="50%" stopColor="#F5B83D" />
      <stop offset="75%" stopColor="#D89A24" />
      <stop offset="100%" stopColor="#8F5B12" />
    </linearGradient>
  </defs>
</svg>

<GiScales
  className="relative h-16 w-16"
  style={{ fill: 'url(#gold-gradient)' }}
/>
        </div>

        <div className="flex w-64 flex-col items-center gap-3">
          <div className="loader-track h-5 w-full">
            <div ref={fillRef} className="loader-track-fill" style={{ width: '0%' }} />
          </div>
          <p className="text-[0.7rem] tracking-wide text-[#e8dcc0]/80">
            {props.label ?? 'Loading…'}
          </p>
          <p
            ref={loreRef}
            className={`${serifFont.className} text-center text-[0.7rem] text-[#f5b83d]`}
          >
            {LORE_LINES[0]}
          </p>
        </div>

        {props.hint && (
          <p ref={hintRef} className="text-center text-[0.7rem] text-[#e8dcc0]/50 opacity-0">
            {props.hint}
          </p>
        )}
      </div>
    </div>
  );
};
