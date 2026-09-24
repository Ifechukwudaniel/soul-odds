import type { IconType } from 'react-icons';
import {
  GiCalendar,
  GiHeartBeats,
  GiHourglass,
  GiOpenBook,
  GiPositionMarker,
  GiSkullCrossedBones,
  GiSkullSignet,
  GiVillage,
} from 'react-icons/gi';
import { RevealSection } from '@/components/game/mortal-odds/stage/reveal/RevealSection';
import { fmtYear } from '@/lib/mortal-odds/format';
import { sinsOf } from '@/lib/mortal-odds/sin-selection';
import type { Life } from '@/types';

type RecordRow = {
  icon: IconType;
  label: string;
  value: string;
};

function lifespanLabel(age: number): string {
  if (age === 0) return 'Under a year';

  return age === 1 ? '1 year' : `${age} years`;
}

const RecordGroup = (props: { rows: RecordRow[] }) => (
  <dl className="record-group flex flex-col gap-2 py-3">
    {props.rows.map((row) => (
      <div key={row.label} className="flex items-center justify-between gap-3 max-md:flex-wrap">
        <dt className="flex items-center gap-2 text-[11px] tracking-[0.15em] text-white/50 uppercase">
          <row.icon size={16} className="shrink-0 text-[#F5B83D]" />

          {row.label}
        </dt>

        <dd className="text-right text-xs text-white max-md:text-left">{row.value}</dd>
      </div>
    ))}
  </dl>
);

export const SoulRecord = (props: { life: Life; placeName: string; alive: boolean }) => {
  const { life } = props;

  const groups: RecordRow[][] = [
    [
      {
        icon: GiCalendar,
        label: 'Born',
        value: fmtYear(life.year),
      },
      {
        icon: GiPositionMarker,
        label: 'Place',
        value: props.placeName,
      },
    ],

    [
      {
        icon: GiSkullCrossedBones,
        label: props.alive ? 'Projected death' : 'Died',
        value: fmtYear(life.deathYear),
      },
      {
        icon: GiHourglass,
        label: 'Lifespan',
        value: lifespanLabel(life.age),
      },
    ],

    [
      {
        icon: GiOpenBook,
        label: 'Literacy',
        value: life.literate ? 'Yes' : 'No',
      },
      {
        icon: GiVillage,
        label: 'Lived in a city',
        value: life.city ? 'Yes' : 'No',
      },
    ],

    [
      {
        icon: GiSkullSignet,
        label: sinsOf(life).length > 1 ? 'Sins' : 'Sin',
        value:
          sinsOf(life).length > 0
            ? sinsOf(life)
                .map((sin) => sin.phrase)
                .join('; ')
            : 'Clean',
      },
      {
        icon: GiHeartBeats,
        label: 'Cause',
        value: props.alive
          ? 'Still living'
          : life.shock
            ? life.shock.label
            : (life.cause ?? 'Ordinary life and death'),
      },
    ],
  ];

  return (
    <RevealSection icon={GiSkullCrossedBones} title="Soul record">
      <div className="mystic-gold-record mystic-glass-gold flex flex-col rounded-xl p-3 px-0 px-3">
        {groups.map((rows) => (
          <RecordGroup key={rows[0]?.label} rows={rows} />
        ))}
      </div>
    </RevealSection>
  );
};
