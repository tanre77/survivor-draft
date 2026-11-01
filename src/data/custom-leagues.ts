import { managers } from "./league.ts";

export type SeatReach = { kind: "email" | "google" | "twitter"; value: string };

export type CustomSeat = {
  id: string;
  name: string;
  picks: string[];
  scores?: number[];
  total?: string;
  prize?: string;
  place?: number;
  reach?: SeatReach;
};

export type CustomLeague = {
  id: string;
  name: string;
  bonus: boolean;
  trades: boolean;
  drafting: boolean;
  advanced: boolean;
  headToHead: boolean;
  seats: CustomSeat[];
  code?: string;
};

const KEY = "draft-custom-leagues";

const PALETTE: { bg: string; fg: string }[] = [
  { bg: "#C45C26", fg: "#1A120C" },
  { bg: "#E8A87C", fg: "#1A120C" },
  { bg: "#D4A054", fg: "#1A120C" },
  { bg: "#7D8B99", fg: "#0E1014" },
  { bg: "#3D6B5A", fg: "#F4F1EC" },
  { bg: "#8F5E73", fg: "#F4F1EC" },
];

export function loadCustomLeagues(): CustomLeague[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomLeague[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((league) => league && typeof league.name === "string" && Array.isArray(league.seats))
      .map((league) => ({
        id: typeof league.id === "string" ? league.id : newId(),
        name: league.name,
        bonus: league.bonus === true,
        trades: league.trades === true,
        drafting: league.drafting !== false,
        advanced: league.advanced === true,
        headToHead: league.headToHead === true,
        ...(typeof league.code === "string" && league.code.trim() ? { code: league.code.trim().toUpperCase() } : {}),
        seats: league.seats.map((seat, index) => ({
          id: typeof seat?.id === "string" ? seat.id : `${league.name}-${index}`,
          name: typeof seat?.name === "string" ? seat.name : "Seat",
          picks: Array.isArray(seat?.picks) ? seat.picks.filter((pick): pick is string => typeof pick === "string" && pick.trim() !== "") : [],
          ...(Array.isArray(seat?.scores) && seat.scores.some((score) => typeof score === "number")
            ? { scores: seat.scores.filter((score): score is number => typeof score === "number") }
            : {}),
          ...(typeof seat?.total === "string" ? { total: seat.total } : {}),
          ...(typeof seat?.prize === "string" ? { prize: seat.prize } : {}),
          ...(typeof seat?.place === "number" ? { place: seat.place } : {}),
          ...(cleanReach(seat?.reach) ? { reach: cleanReach(seat?.reach) } : {}),
        })),
      }));
  } catch {
    return [];
  }
}

export function saveCustomLeagues(leagues: CustomLeague[]) {
  localStorage.setItem(KEY, JSON.stringify(leagues));
}

export function eraseCustomLeagues() {
  localStorage.removeItem(KEY);
}

export const PICKS_PER_TEAM = 3;
export const MAX_TIMES_DRAFTED = 4;

export function snakeSlot(pickNumber: number, count: number): number {
  if (count <= 1) return 0;
  const round = Math.floor(pickNumber / count);
  const slot = pickNumber % count;
  return round % 2 === 0 ? slot : count - 1 - slot;
}

export function nextDrafter<T extends { picks: string[] }>(seats: T[]): T | null {
  if (seats.length === 0) return null;
  const made = seats.reduce((sum, seat) => sum + seat.picks.length, 0);
  if (made >= seats.length * PICKS_PER_TEAM) return null;
  return seats[snakeSlot(made, seats.length)] ?? null;
}

export function draftIsFull(seats: { picks: string[] }[]): boolean {
  return seats.length > 0 && nextDrafter(seats) == null;
}

export function cleanReach(value: unknown): SeatReach | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as { kind?: unknown; value?: unknown };
  const kind = row.kind === "google" || row.kind === "twitter" || row.kind === "email" ? row.kind : null;
  const text = typeof row.value === "string" ? row.value.trim().slice(0, 120) : "";
  if (!kind || !text) return undefined;
  return { kind, value: kind === "twitter" ? text.replace(/^@/, "") : text };
}

export function leagueStillOpen(league: { drafting?: boolean; seats: { picks: string[]; scores?: number[] }[] }): boolean {
  if (league.seats.some((seat) => seat.scores != null && seat.scores.length > 0)) return false;
  if (league.drafting === false && draftIsFull(league.seats)) return false;
  return true;
}

export function lastDrafter<T extends { picks: string[] }>(seats: T[]): T | null {
  if (seats.length === 0) return null;
  const made = seats.reduce((sum, seat) => sum + seat.picks.length, 0);
  if (made === 0) return null;
  return seats[snakeSlot(made - 1, seats.length)] ?? null;
}

export function shuffleSeats<T>(list: T[]): T[] {
  const next = [...list];
  const bytes = new Uint32Array(next.length);
  crypto.getRandomValues(bytes);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = bytes[i] % (i + 1);
    const swap = next[i];
    next[i] = next[j];
    next[j] = swap;
  }
  return next;
}

export function pairSeats<T>(seats: T[]): [T, T | null][] {
  const pairs: [T, T | null][] = [];
  for (let i = 0; i < seats.length; i += 2) pairs.push([seats[i], seats[i + 1] ?? null]);
  return pairs;
}

/** Lowest score wins a head-to-head. Open means someone has no score yet. */
export function matchupWinner(a: number | null, b: number | null): "a" | "b" | "tie" | "open" {
  if (a == null || b == null) return "open";
  if (a === b) return "tie";
  return a < b ? "a" : "b";
}

export function newId(): string {
  return crypto.randomUUID();
}

export function rosterKey(picks: string[]): string {
  return picks
    .map((pick) => pick.trim().toLowerCase())
    .filter((pick) => pick !== "")
    .sort()
    .join("\0");
}

/** Name of another seat that already has this exact roster. Order does not matter. Empty rosters never match. */
export function takenBy(seats: { id: string; name: string; picks: string[] }[], picks: string[], skipIds: string[]): string | null {
  const key = rosterKey(picks);
  if (!key) return null;
  for (const seat of seats) {
    if (skipIds.includes(seat.id)) continue;
    if (rosterKey(seat.picks) === key) return seat.name;
  }
  return null;
}

export function seatColors(name: string, index: number): { bg: string; fg: string } {
  const known = managers.find((m) => m.name.toLowerCase() === name.trim().toLowerCase());
  if (known) return { bg: known.bg, fg: known.fg };
  return PALETTE[index % PALETTE.length];
}
