import { isSoundMuted } from "@/utils/soundPreferences";

export type Sound = { name: "spend"; amount: number } | { name: "search-tick"; step: number } | { name: "search-lock" };

// Partial ratios and relative levels of a struck metal bell: inharmonic overtones are what read as "coin", not "beep".
const BELL_PARTIALS = [
  { ratio: 1, gain: 1 },
  { ratio: 2.76, gain: 0.45 },
  { ratio: 5.4, gain: 0.2 },
];

const SPEND_SRC = "/sound/dragon-studio-coins-dropping-into-wooden-box-467468.mp3";
// The clip is mastered hot (its peaks pass full scale); this brings it level with the button click.
const SPEND_VOLUME = 0.45;
const SPEND_FADE_SECONDS = 0.06;

const fetchSpendData = () => fetch(SPEND_SRC).then((response) => response.arrayBuffer());

// Start fetching as soon as the module loads in the browser, so the first spend doesn't wait on the network.
let spendData: Promise<ArrayBuffer> | null = typeof window === "undefined" ? null : fetchSpendData();
let spendBuffer: Promise<AudioBuffer> | null = null;

/** Decodes the coin clip once and reuses it. */
const getSpendBuffer = (ctx: AudioContext) => {
  spendData ??= fetchSpendData();
  spendBuffer ??= spendData.then((data) => ctx.decodeAudioData(data));
  return spendBuffer;
};

let context: AudioContext | null = null;

/** Lazily creates the shared audio context; returns null until the browser lets it run (needs a prior user gesture). */
const getRunningContext = () => {
  context ??= new AudioContext();
  if (context.state !== "running") {
    void context.resume();
    return null;
  }
  return context;
};

/** How much of the coin clip a spend of `amount` plays: the first burst of hits, then more of the cascade, then the whole thing. */
export const spendSoundSeconds = (amount: number) => {
  if (amount <= 5) {
    return 0.42;
  }
  if (amount <= 10) {
    return 0.78;
  }
  return 1.25;
};

/** Strikes a bell: each overtone decays faster than the one below it. */
const ring = (ctx: AudioContext, options: { frequency: number; start: number; decay: number; volume: number }) => {
  BELL_PARTIALS.forEach((partial, index) => {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const end = options.start + options.decay / (index + 1);
    oscillator.frequency.value = options.frequency * partial.ratio;
    envelope.gain.setValueAtTime(0.0001, options.start);
    envelope.gain.exponentialRampToValueAtTime(options.volume * partial.gain, options.start + 0.004);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(envelope).connect(ctx.destination);
    oscillator.start(options.start);
    oscillator.stop(end + 0.02);
  });
};

/** Coins dropping into a wooden box; larger spends play more of the cascade. */
const playSpend = async (ctx: AudioContext, amount: number) => {
  const buffer = await getSpendBuffer(ctx);
  const rate = 0.96 + Math.random() * 0.08;
  const seconds = Math.min(spendSoundSeconds(amount), buffer.duration);
  const wallSeconds = seconds / rate;
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  const envelope = ctx.createGain();
  source.buffer = buffer;
  // A slight pitch drift keeps repeated spends from sounding identical.
  source.playbackRate.value = rate;
  envelope.gain.setValueAtTime(SPEND_VOLUME, now);
  envelope.gain.setValueAtTime(SPEND_VOLUME, now + wallSeconds - SPEND_FADE_SECONDS);
  envelope.gain.linearRampToValueAtTime(0, now + wallSeconds);
  source.connect(envelope).connect(ctx.destination);
  source.start(now, 0, seconds);
};

/** A short wooden "tock" whose pitch climbs with each step as the search closes in. */
const playTick = (ctx: AudioContext, step: number) => {
  const now = ctx.currentTime;
  const frequency = 620 * 1.1 ** step;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency * 1.6, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.05);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.18, now + 0.004);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  oscillator.connect(envelope).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.1);
};

/** The pin lands: a soft low thud under a two-note chime. */
const playLock = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  const thud = ctx.createOscillator();
  const envelope = ctx.createGain();
  thud.frequency.setValueAtTime(140, now);
  thud.frequency.exponentialRampToValueAtTime(55, now + 0.18);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  thud.connect(envelope).connect(ctx.destination);
  thud.start(now);
  thud.stop(now + 0.22);

  ring(ctx, { frequency: 660, start: now, decay: 1.1, volume: 0.09 });
  ring(ctx, { frequency: 990, start: now + 0.09, decay: 1.4, volume: 0.07 });
};

/** Plays a synthesized game sound effect, unless the player has muted sound. */
export const playSound = (sound: Sound) => {
  if (isSoundMuted()) {
    return;
  }
  const ctx = getRunningContext();
  if (!ctx) {
    return;
  }
  switch (sound.name) {
    case "spend":
      playSpend(ctx, sound.amount).catch(() => {});
      break;
    case "search-tick":
      playTick(ctx, sound.step);
      break;
    case "search-lock":
      playLock(ctx);
      break;
  }
};
