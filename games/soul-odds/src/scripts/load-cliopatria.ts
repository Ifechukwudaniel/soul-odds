import { loadCliopatria } from "@/lib/mortal-odds/cliopatria";

async function main() {
  const startedAt = Date.now();
  const features = await loadCliopatria();
  const elapsedMs = Date.now() - startedAt;

  console.log(`Loaded ${features.length} Cliopatria polities in ${elapsedMs}ms.`);

  const sample = features[0];
  if (sample) {
    console.log(`Sample: ${sample.properties.Name} (${sample.properties.FromYear}..${sample.properties.ToYear})`);
  }
}

main();
