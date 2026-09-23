import { fmtPeople, fmtYear } from "@/lib/mortal-odds/format";
import { estimatePopulation } from "@/lib/mortal-odds/population-estimate";

/**
 * Answers "what was the population of this in this year" from the game's own figures, in one line:
 *
 *   tsx src/scripts/ask-population.ts "Roman Empire" 100
 *
 * The year is negative for BCE. The name is matched case-insensitively, and a part of a name
 * ("Achaemenid") finds the shortest polity that contains it.
 */

const [name, yearArg] = process.argv.slice(2);
const year = Number(yearArg);
if (!name || yearArg === undefined || !Number.isInteger(year)) throw new Error('Usage: ask-population.ts "<polity name>" <year, negative for BCE>');

const estimate = estimatePopulation({ empire: name, year });

console.log(estimate ? `${estimate.empire}, ${fmtYear(year)}: about ${fmtPeople(estimate.population)} people` : `No polity called "${name}" existed in ${fmtYear(year)}.`);
