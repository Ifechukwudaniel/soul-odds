import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { decodeAbiParameters, formatUnits, type Hex, parseUnits } from 'viem';
import {
  type SoulConfigurationDefinition,
  toConfiguration,
  toConfigurationInput,
} from '../../../src/configuration.ts';
import {
  encodePrediction,
  maxPayout,
  predictionPayout,
  predictionProbabilityWad,
  type SoulPrediction,
} from '../../../src/soul.ts';
import titleFile from '../../title.json';
import { useCasinoHost } from './useCasinoHost.ts';

const definition = titleFile.betConfigurations[0] as SoulConfigurationDefinition;
const configuration = toConfiguration(toConfigurationInput(definition));
const CRIME_NAMES = definition.crimes.map(crime => crime.name);

const WAD = 10n ** 18n;
// SessionPhase enum from ICasinoGameV2.sol
const PHASE_SETTLED = 3;
const PHASE_FORFEITED = 4;
const PHASE_CANCELLED = 5;

function isTerminalPhase(phase: number | undefined): boolean {
  return phase === PHASE_SETTLED || phase === PHASE_FORFEITED || phase === PHASE_CANCELLED;
}

const settledGameStateAbi = [
  {
    type: 'tuple',
    components: [
      { type: 'uint8', name: 'gender' },
      { type: 'uint8', name: 'lifespanBucket' },
      { type: 'bool', name: 'sins' },
      { type: 'uint8', name: 'crimeMask' },
    ],
  },
  {
    type: 'tuple',
    components: [
      { type: 'uint8', name: 'gender' },
      { type: 'uint16', name: 'age' },
      { type: 'uint8', name: 'lifespanBucket' },
      { type: 'uint8', name: 'crimeMask' },
    ],
  },
  { type: 'bool' },
] as const;

function decodeSettledGameState(gameState: Hex) {
  const [, result, won] = decodeAbiParameters(settledGameStateAbi, gameState);
  return { result, won };
}

function crimeLabel(mask: number): string {
  if (mask === 0) return 'no crime';
  return CRIME_NAMES.filter((_, index) => (mask & (1 << index)) !== 0).join(' + ');
}

/** Toggles `slot` in `mask`, refusing a third crime (at most two may be predicted). */
function toggleCrime(mask: number, slot: number): number {
  const bit = 1 << slot;
  if ((mask & bit) !== 0) return mask & ~bit;
  const popcount = [0, 1, 2, 3].filter(i => (mask & (1 << i)) !== 0).length;
  return popcount >= 2 ? mask : mask | bit;
}

type Round = {
  sessionKey: string;
  wager: bigint;
  prediction: SoulPrediction;
  status: 'opening' | 'awaiting-action' | 'waiting' | 'done';
  sessionId?: string;
  won?: boolean;
  age?: number;
  payout?: bigint;
};

export function App() {
  const { hostApi, snapshot } = useCasinoHost();

  const [gender, setGender] = useState<0 | 1>(0);
  const [lifespanBucket, setLifespanBucket] = useState(0);
  const [crimeMask, setCrimeMask] = useState(0);
  const [wagerInput, setWagerInput] = useState('1.00');
  const [round, setRound] = useState<Round | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submittedFor = useRef<Set<string>>(new Set());

  const prediction: SoulPrediction = useMemo(
    () => ({ gender, lifespanBucket, sins: crimeMask !== 0, crimeMask }),
    [gender, lifespanBucket, crimeMask],
  );

  const decimals = snapshot?.token.decimals ?? 18;
  const symbol = snapshot?.token.symbol ?? '';
  const balance = useMemo(() => {
    const raw = snapshot?.balances.smartVaultBalance;
    return raw !== undefined ? BigInt(raw) : undefined;
  }, [snapshot?.balances.smartVaultBalance]);

  const wager = useMemo(() => {
    if (!wagerInput.trim()) return null;
    try {
      const parsed = parseUnits(wagerInput.trim(), decimals);
      return parsed > 0n ? parsed : null;
    } catch {
      return null;
    }
  }, [wagerInput, decimals]);

  const previewProbabilityWad = predictionProbabilityWad(configuration, prediction);
  const previewPayout = wager !== null ? predictionPayout(configuration, wager, prediction) : 0n;
  const previewMultiplier = previewProbabilityWad > 0n ? Number(previewPayout) / Number(wager ?? WAD) : 0;

  // Once the opened session's row appears, submit the prediction as the player action.
  useEffect(() => {
    if (!round || round.status !== 'awaiting-action' || !snapshot || !hostApi) return;
    const row = snapshot.sessions.items.find(item => item.sessionKey === round.sessionKey);
    if (!row || submittedFor.current.has(round.sessionKey)) return;
    submittedFor.current.add(round.sessionKey);
    void hostApi
      .submitAction({ sessionId: row.sessionId, actionData: encodePrediction(round.prediction) })
      .then(() => {
        setRound(current =>
          current?.sessionKey === round.sessionKey
            ? { ...current, status: 'waiting', sessionId: row.sessionId }
            : current,
        );
      })
      .catch(cause => {
        submittedFor.current.delete(round.sessionKey);
        setError(cause instanceof Error ? cause.message : 'Failed to submit the prediction.');
        setRound(null);
      });
  }, [round, snapshot, hostApi]);

  // Settle the active round once the host's session list shows it terminal.
  useEffect(() => {
    if (!round || round.status !== 'waiting' || !snapshot) return;
    const row = snapshot.sessions.items.find(item => item.sessionKey === round.sessionKey);
    if (!row || !(row.isSettled || isTerminalPhase(row.phase)) || !row.raw.gameState) return;

    const { result, won } = decodeSettledGameState(row.raw.gameState);
    const payout = row.payout !== undefined ? BigInt(row.payout) : 0n;
    setRound(current =>
      current && current.sessionKey === round.sessionKey
        ? { ...current, status: 'done', won, age: result.age, payout }
        : current,
    );
  }, [snapshot, round]);

  // A settled round is display-only on the host once revealed; settlement itself is already final.
  const hostApiRef = useRef(hostApi);
  hostApiRef.current = hostApi;
  useEffect(() => {
    if (!round || round.status !== 'done' || !round.sessionId) return;
    void hostApiRef.current?.revealOutcome({ sessionId: round.sessionId }).catch(() => {});
  }, [round]);

  const openRound = useCallback(
    async (nextPrediction: SoulPrediction, nextWager: bigint) => {
      if (!hostApi) return;
      setError(null);
      const pendingKey = `pending:${Date.now()}`;
      setRound({ sessionKey: pendingKey, wager: nextWager, prediction: nextPrediction, status: 'opening' });
      try {
        const { sessionKey } = await hostApi.openSession({ wager: nextWager.toString(), gameData: '0x' });
        setRound(current =>
          current?.sessionKey === pendingKey
            ? { ...current, sessionKey, status: 'awaiting-action' }
            : current,
        );
      } catch (cause) {
        setRound(null);
        setError(cause instanceof Error ? cause.message : 'Failed to open the round.');
      }
    },
    [hostApi],
  );

  if (!hostApi || !snapshot) {
    return (
      <div className="waiting">
        <span>Connecting to host…</span>
      </div>
    );
  }

  const walletReady = snapshot.wallet.status === 'ready';
  const roundInFlight =
    round !== null &&
    (round.status === 'opening' || round.status === 'awaiting-action' || round.status === 'waiting');
  const roundDone = round?.status === 'done';
  const insufficientBalance = wager !== null && balance !== undefined && wager > balance;

  const reason = !walletReady
    ? 'Connect your wallet in the host app to play.'
    : error
      ? error
      : insufficientBalance
        ? 'Insufficient balance.'
        : null;

  const canBet = walletReady && !roundInFlight && wager !== null && !insufficientBalance;
  const ctaLabel = roundInFlight ? 'Reading the omens…' : roundDone ? 'Read again' : 'Read the soul';

  return (
    <div className="shell">
      <div className="panel">
        <h1>Ancient Souls</h1>
        <p className="lines">
          {definition.era}, {definition.minBirthYear}–{definition.maxBirthYear}
        </p>

        <div className="field">
          <span>Gender</span>
          <div className="picker">
            <button
              className={gender === 0 ? 'chip chip--active' : 'chip'}
              onClick={() => setGender(0)}
              disabled={roundInFlight}
            >
              Male
            </button>
            <button
              className={gender === 1 ? 'chip chip--active' : 'chip'}
              onClick={() => setGender(1)}
              disabled={roundInFlight}
            >
              Female
            </button>
          </div>
        </div>

        <div className="field">
          <span>Lifespan</span>
          <div className="picker picker--column">
            {definition.lifespans.map((lifespan, index) => (
              <button
                key={index}
                className={lifespanBucket === index ? 'chip chip--active' : 'chip'}
                onClick={() => setLifespanBucket(index)}
                disabled={roundInFlight}
              >
                {lifespan.minYears}–{lifespan.maxYears}y
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Crimes (up to two)</span>
          <div className="picker picker--column">
            {CRIME_NAMES.map((name, index) => (
              <button
                key={name}
                className={(crimeMask & (1 << index)) !== 0 ? 'chip chip--active' : 'chip'}
                onClick={() => setCrimeMask(current => toggleCrime(current, index))}
                disabled={roundInFlight}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Wager ({symbol})</span>
          <input
            value={wagerInput}
            onChange={event => setWagerInput(event.target.value)}
            disabled={roundInFlight}
            inputMode="decimal"
          />
        </div>

        <div className="meta">
          <span>Predicting</span>
          <span>{crimeLabel(crimeMask)}</span>
        </div>
        <div className="meta">
          <span>Odds</span>
          <span>{(Number(previewProbabilityWad) / 1e16).toFixed(4)}%</span>
        </div>
        <div className="meta">
          <span>Pays</span>
          <span>{previewMultiplier.toFixed(4)}x</span>
        </div>
        <div className="meta">
          <span>Max payout on this title</span>
          <span>{(Number(maxPayout(configuration, WAD)) / 1e18).toFixed(4)}x</span>
        </div>

        {reason && <p className="reason">{reason}</p>}
        <button
          className="spin"
          disabled={!canBet}
          onClick={() => wager !== null && void openRound(prediction, wager)}
        >
          {ctaLabel}
        </button>
      </div>

      <div className="stage">
        {round?.status === 'done' ? (
          <div className="result result--visible">
            <strong>{round.won ? 'The soul matches your reading' : 'The soul slips away'}</strong>
            <span>
              age {round.age} — payout {formatUnits(round.payout ?? 0n, decimals)} {symbol}
            </span>
          </div>
        ) : (
          <div className="result">
            <strong>Cast your reading, then submit it to the ether.</strong>
          </div>
        )}
      </div>
    </div>
  );
}
