import { PiArrowRight } from 'react-icons/pi';
import { GameButton } from '@/components/game/GameButton';

export const PlaceBetButton = (props: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <GameButton
    variant="papyrus"
    disabled={props.disabled}
    onClick={() => props.onClick?.()}
    className="w-full py-3 text-base"
  >
    {props.label}
    <PiArrowRight className="h-4 w-4" />
  </GameButton>
);
