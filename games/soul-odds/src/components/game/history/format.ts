import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';

/** Signed amount with a real minus sign, e.g. "+8.00" or "−3.50". */
export function fmtSigned(amount: number): string {
  return `${amount >= 0 ? '+' : '−'}${Math.abs(amount).toFixed(2)}`;
}

export function fmtShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function fmtSettledAt(timestamp: number): string {
  return `${fmtShortDate(timestamp)} · ${new Date(timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
}

export function isStillLiving(entry: BetHistoryEntry): boolean {
  return entry.deathYear >= new Date(entry.settledAt).getFullYear();
}

export function soulLabel(entry: BetHistoryEntry): string {
  return entry.name ?? (entry.sex === 'girl' ? 'A girl' : 'A boy');
}

export function fateLine(entry: BetHistoryEntry): string {
  if (isStillLiving(entry)) return `${soulLabel(entry)}, still living`;
  return entry.age === 0
    ? `${soulLabel(entry)}, gone within a year`
    : `${soulLabel(entry)}, dead at ${entry.age}`;
}
