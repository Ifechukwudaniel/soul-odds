import { parseUnits } from 'viem';

// =====================================
// ⬢ Token and wallet
// =====================================
export const DEMO_DECIMALS = 18;
export const DEMO_STARTING_BALANCE = parseUnits('1000', DEMO_DECIMALS);
export const DEMO_SMALLEST_CHIP = parseUnits('1', DEMO_DECIMALS);
export const DEMO_GAME = '0x0000000000000000000000000000000000000002';

// =====================================
// ⬢ Simulated latency
// =====================================
export const DEMO_OPEN_LATENCY_MS = 250;
export const DEMO_SETTLE_LATENCY_MS = 800;

// =====================================
// ⬢ Persistence
// =====================================
export const DEMO_MAX_SAVED_SESSIONS = 20;
