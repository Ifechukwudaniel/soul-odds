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
  predictionMaxPayout,
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
      { type: 'int16', name: 'birthYear' },
      { type: 'uint8', name: 'lifespanBucket' },
      { type: 'uint8', name: 'crimeMask' },
    ],
  },
  { type: 'bool' },
  {
    type: 'tuple',
    components: [
      { type: 'bool', name: 'genderMatch' },
      { type: 'bool', name: 'lifespanMatch' },
      { type: 'bool', name: 'crimeMatch' },
    ],
  },
] as const;

function decodeSettledGameState(gameState: Hex) {
  const [, result, won, breakdown] = decodeAbiParameters(settledGameStateAbi, gameState);
  return { result, won, breakdown };
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

type RevealedSoul = { gender: number; age: number; birthYear: number; lifespanBucket: number; crimeMask: number };
type MatchBreakdown = { genderMatch: boolean; lifespanMatch: boolean; crimeMatch: boolean };

type Round = {
  sessionKey: string;
  wager: bigint;
  prediction: SoulPrediction;
  status: 'opening' | 'awaiting-action' | 'waiting' | 'done';
  sessionId?: string;
  won?: boolean;
  soul?: RevealedSoul;
  breakdown?: MatchBreakdown;
  payout?: bigint;
};

/** The guided flow: gender, then age, then whether a crime happened, then which ones, then review. */
type WizardStep = 'gender' | 'age' | 'has-crime' | 'pick-crimes' | 'review';

export function App() {
  const { hostApi, snapshot } = useCasinoHost();

  const [history, setHistory] = useState<WizardStep[]>(['gender']);
  const step = history[history.length - 1];

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

  const goTo = (next: WizardStep) => setHistory(current => [...current, next]);
  const goBack = () => setHistory(current => (current.length > 1 ? current.slice(0, -1) : current));
  const restart = () => {
    setHistory(['gender']);
    setCrimeMask(0);
    setRound(null);
    setError(null);
  };

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

  // Odds/payout of the full-house event (all three categories). Getting only some right still pays
  // out partial credit per category, so this understates what a bet can actually win.
  const previewProbabilityWad = predictionProbabilityWad(configuration, prediction);
  const previewPayout = wager !== null ? predictionMaxPayout(configuration, wager, prediction) : 0n;
  const previewMultiplier = Number(previewPayout) / Number(wager ?? WAD);

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

    try {
      const { result, won, breakdown } = decodeSettledGameState(row.raw.gameState);
      const payout = row.payout !== undefined ? BigInt(row.payout) : 0n;
      setRound(current =>
        current && current.sessionKey === round.sessionKey
          ? { ...current, status: 'done', won, soul: { ...result }, breakdown: { ...breakdown }, payout }
          : current,
      );
    } catch {
      // The deployed title's bytecode doesn't match this frontend's expected game-state shape
      // (e.g. the local chain still has an older SoulOddsEngine) — surface it instead of crashing.
      setError('Could not read the settled soul — redeploy the title against the current contract.');
      setRound(null);
    }
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
  // The full-house combo can be unreachable (e.g. this lifespan bucket never has that exact crime
  // state) while gender/lifespan/crimes still each pay out their own partial credit independently.
  const impossibleFullHouse = previewProbabilityWad === 0n;

  const reason = !walletReady
    ? 'Connect your wallet in the host app to play.'
    : error
      ? error
      : insufficientBalance
        ? 'Insufficient balance.'
        : impossibleFullHouse
          ? 'This exact combination can never fully match, but gender/lifespan/crimes still pay partial credit independently.'
          : null;

  const canBet = walletReady && !roundInFlight && wager !== null && !insufficientBalance;

  const chooseHasCrime = (next: boolean) => {
    if (!next) {
      setCrimeMask(0);
      goTo('review');
    } else {
      goTo('pick-crimes');
    }
  };

  return (
    <div className="shell">
      <div className="panel">
        <h1>Ancient Souls</h1>
        <p className="lines">
          {definition.era}, {definition.minBirthYear}–{definition.maxBirthYear}
        </p>

        {step === 'gender' && (
          <div className="field">
            <span>Step 1 — Gender</span>
            <div className="picker picker--column">
              <button className="chip" onClick={() => (setGender(0), goTo('age'))}>
                Male
              </button>
              <button className="chip" onClick={() => (setGender(1), goTo('age'))}>
                Female
              </button>
            </div>
          </div>
        )}

        {step === 'age' && (
          <div className="field">
            <span>Step 2 — Age at death</span>
            <div className="picker picker--column">
              {definition.lifespans.map((lifespan, index) => (
                <button
                  key={index}
                  className="chip"
                  onClick={() => {
                    setLifespanBucket(index);
                    const nowCrimesPossible = configuration.lifespans[index].noCrimeWeight < 10000n;
                    goTo(nowCrimesPossible ? 'has-crime' : 'review');
                  }}
                >
                  {lifespan.minYears}–{lifespan.maxYears}y
                </button>
              ))}
            </div>
            <button className="back" onClick={goBack}>
              ← back
            </button>
          </div>
        )}

        {step === 'has-crime' && (
          <div className="field">
            <span>Step 3 — Did they commit a crime?</span>
            <div className="picker">
              <button className="chip" onClick={() => chooseHasCrime(false)}>
                No
              </button>
              <button className="chip" onClick={() => chooseHasCrime(true)}>
                Yes
              </button>
            </div>
            <button className="back" onClick={goBack}>
              ← back
            </button>
          </div>
        )}

        {step === 'pick-crimes' && (
          <div className="field">
            <span>Step 4 — Which crime(s)? (up to two)</span>
            <div className="picker picker--column">
              {CRIME_NAMES.map((name, index) => (
                <button
                  key={name}
                  className={(crimeMask & (1 << index)) !== 0 ? 'chip chip--active' : 'chip'}
                  onClick={() => setCrimeMask(current => toggleCrime(current, index))}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="picker">
              <button className="back" onClick={goBack}>
                ← back
              </button>
              <button className="chip chip--active" disabled={crimeMask === 0} onClick={() => goTo('review')}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <>
            <div className="field">
              <span>Your reading</span>
              <p className="lines">
                {gender === 0 ? 'Male' : 'Female'}, died {definition.lifespans[lifespanBucket].minYears}–
                {definition.lifespans[lifespanBucket].maxYears}y, {crimeLabel(crimeMask)}
              </p>
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
              <span>Full-house odds</span>
              <span>{(Number(previewProbabilityWad) / 1e16).toFixed(4)}%</span>
            </div>
            <div className="meta">
              <span>Full-house pays</span>
              <span>{previewMultiplier.toFixed(4)}x</span>
            </div>
            <p className="lines">Get gender, lifespan or crimes right on their own and you still get partial credit.</p>
            <div className="meta">
              <span>Max payout on this title</span>
              <span>{(Number(maxPayout(configuration, WAD)) / 1e18).toFixed(4)}x</span>
            </div>

            {reason && <p className="reason">{reason}</p>}

            {roundDone ? (
              <button className="spin" onClick={restart}>
                Read again
              </button>
            ) : (
              <>
                <button
                  className="spin"
                  disabled={!canBet}
                  onClick={() => wager !== null && void openRound(prediction, wager)}
                >
                  {roundInFlight ? 'Reading the omens…' : 'Read the soul'}
                </button>
                {!roundInFlight && (
                  <button className="back" onClick={goBack}>
                    ← back
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="stage">
        {round?.status === 'done' && round.soul && round.breakdown ? (
          <div className="result result--visible">
            <strong>{round.won ? 'The soul matches your reading' : 'The soul slips away'}</strong>
            <div className="reveal">
              <div className="reveal-column">
                <span className="reveal-label">Your reading</span>
                <span>{round.prediction.gender === 0 ? 'Male' : 'Female'}</span>
                <span>
                  bucket {definition.lifespans[round.prediction.lifespanBucket].minYears}–
                  {definition.lifespans[round.prediction.lifespanBucket].maxYears}y
                </span>
                <span>{crimeLabel(round.prediction.crimeMask)}</span>
              </div>
              <div className="reveal-column">
                <span className="reveal-label">The soul</span>
                <span>{round.soul.gender === 0 ? 'Male' : 'Female'}</span>
                <span>
                  bucket {definition.lifespans[round.soul.lifespanBucket].minYears}–
                  {definition.lifespans[round.soul.lifespanBucket].maxYears}y (born {round.soul.birthYear}, died at{' '}
                  {round.soul.age})
                </span>
                <span>{crimeLabel(round.soul.crimeMask)}</span>
              </div>
            </div>
            <div className="reveal-matches">
              <span className={round.breakdown.genderMatch ? 'match-yes' : 'match-no'}>
                gender {round.breakdown.genderMatch ? '✓' : '✗'}
              </span>
              <span className={round.breakdown.lifespanMatch ? 'match-yes' : 'match-no'}>
                lifespan {round.breakdown.lifespanMatch ? '✓' : '✗'}
              </span>
              <span className={round.breakdown.crimeMatch ? 'match-yes' : 'match-no'}>
                crimes {round.breakdown.crimeMatch ? '✓' : '✗'}
              </span>
            </div>
            <span>payout {formatUnits(round.payout ?? 0n, decimals)} {symbol}</span>
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
