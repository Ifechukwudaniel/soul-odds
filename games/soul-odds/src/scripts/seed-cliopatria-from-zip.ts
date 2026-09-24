import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { seedCliopatria } from '@/services/seedCliopatria';

const execFileAsync = promisify(execFile);

const DATASET_DIR = path.join(process.cwd(), 'cliopatria.geojson');
const ZIP_PATH = path.join(DATASET_DIR, 'cliopatria_polities_only.zip');
const GEOJSON_PATH = path.join(DATASET_DIR, 'cliopatria_polities_only.geojson');

async function main() {
  if (existsSync(GEOJSON_PATH)) {
    console.log('*** cliopatria_polities_only.geojson already present. Skipping unzip.');
  } else if (!existsSync(ZIP_PATH)) {
    console.log('*** cliopatria_polities_only.zip not found locally. Skipping unzip and seed.');
    return;
  } else {
    console.log('Unzipping cliopatria_polities_only.zip...');
    await execFileAsync('unzip', ['-o', ZIP_PATH, '-d', DATASET_DIR]);
  }

  await seedCliopatria();
}

main();
