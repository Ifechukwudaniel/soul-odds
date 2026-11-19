// Regenerates chain/era-crime-masks.json from the title's crime selection weights.
// Usage: pnpm run generate:crime-masks   (after changing soul-odds-title.json's crimes)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { exactCrimeMaskCounts } from '../chain/crime-mask-enumeration.ts';
import titleFile from '../src/config/mortal-odds/soul-odds-title.json' with { type: 'json' };

const output = Object.fromEntries(
  titleFile.betConfigurations.map((era) => [
    era.name,
    exactCrimeMaskCounts(era.crimes.map((crime) => crime.selectionWeight)),
  ]),
);
writeFileSync(
  fileURLToPath(new URL('../chain/era-crime-masks.json', import.meta.url)),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(`wrote ${Object.keys(output).length} eras`);
