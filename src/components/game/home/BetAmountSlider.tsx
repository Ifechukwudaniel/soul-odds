export const BetAmountSlider = (props: { min: number; max: number; value: number; onChange: (value: number) => void }) => {
  const percentage = ((props.value - props.min) / (props.max - props.min)) * 100;

  return (
    <input
      type="range"
      min={props.min}
      max={props.max}
      step={1}
      value={props.value}
      onChange={(event) => props.onChange(Number(event.target.value))}
      style={{
        background: `linear-gradient(90deg, #9181F0 0%, #6752EF ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
      }}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full
        [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-gradient-to-r
        [&::-moz-range-thumb]:from-[#9181F0] [&::-moz-range-thumb]:to-[#6752EF]
        [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent
        [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent
        [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border
        [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#9181F0]
        [&::-webkit-slider-thumb]:to-[#6752EF]"
    />
  );
};
