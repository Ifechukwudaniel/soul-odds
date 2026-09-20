import { readFileSync } from 'node:fs';
import {
  type CompiledSoulConfiguration,
  type SoulTitleDefinition,
  toConfiguration,
  toConfigurationInput,
} from './configuration.ts';

export type CompiledSoulTitle = {
  name: string;
  betConfigurations: CompiledSoulConfiguration[];
};

/** Reads and validates a title definition, encoding each bet configuration for `deployTitle`. */
export function loadTitleFile(path: string): CompiledSoulTitle {
  const definition = JSON.parse(readFileSync(path, 'utf8')) as SoulTitleDefinition;
  if (!Array.isArray(definition.betConfigurations) || definition.betConfigurations.length === 0) {
    throw new Error('A title needs at least one bet configuration');
  }
  return {
    name: definition.name,
    betConfigurations: definition.betConfigurations.map(configurationDefinition => {
      try {
        const input = toConfigurationInput(configurationDefinition);
        return { definition: configurationDefinition, input, configuration: toConfiguration(input) };
      } catch (error) {
        throw new Error(
          `Bet configuration "${configurationDefinition.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }),
  };
}
