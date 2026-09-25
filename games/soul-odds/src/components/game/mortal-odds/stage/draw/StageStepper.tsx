export const StageStepper = (props: { steps: readonly string[]; activeIndex: number }) => (
  <ol className="flex items-center justify-center gap-2">
    {props.steps.map((step, index) => {
      const isActive = index === props.activeIndex;
      const isDone = index < props.activeIndex;
      return (
        <li key={step} className="flex items-center gap-2">
          {index > 0 && (
            <span className={`h-px w-8 ${isDone ? 'bg-[#F5B83D]/60' : 'bg-white/15'}`} />
          )}
          <span
            className={`h-2 w-2 rounded-full ${isActive || isDone ? 'gold' : 'border border-white/30 bg-transparent'}`}
          />
          <span
            className={`text-[11px] tracking-[0.2em] uppercase ${isActive ? 'text-white' : 'text-white/40'}`}
            aria-current={isActive ? 'step' : undefined}
          >
            {step}
          </span>
        </li>
      );
    })}
  </ol>
);
