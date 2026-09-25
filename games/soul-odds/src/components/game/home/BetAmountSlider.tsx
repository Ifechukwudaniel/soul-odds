/** A range slider for the wager between `min` and `max`, filled with the gold gradient up to the thumb. */
export const BetAmountSlider = (props: {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
}) => {
  // ✦ The typed field accepts any amount; the slider just pins to its ends when the stake is outside its range.
  const clamped = Math.min(props.max, Math.max(props.min, props.value));
  const percentage = ((clamped - props.min) / (props.max - props.min)) * 100;

  return (
    <input
      type="range"
      min={props.min}
      max={props.max}
      step={1}
      value={clamped}
      disabled={props.disabled}
      aria-label={props.label}
      onChange={(event) => props.onChange(Number(event.target.value))}
      style={{ '--fill': `${percentage}%` } as React.CSSProperties}
      className="wager-slider w-full"
    />
  );
};
