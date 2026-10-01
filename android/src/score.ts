import { board } from "./data/board";

export type Contestant = (typeof board.contestants)[number];
export type Manager = (typeof board.managers)[number];

export function released(at: string | undefined, now: number): boolean {
  if (!at) return true;
  const time = Date.parse(at);
  return Number.isFinite(time) && now >= time;
}

export function isBootPublic(contestant: Contestant, now = Date.now()): boolean {
  return contestant.status === "out" && released(contestant.revealAt ?? undefined, now);
}

export function displayName(contestant: Contestant): string {
  if (contestant.id === "kilby") return "Danny Kilby";
  return `${contestant.first} ${contestant.last}`.trim();
}

function count(kind: "idols" | "wins", id: string, now: number): number {
  const row = board.bonuses[id];
  if (!row) return 0;
  const value = row[kind];
  const at = kind === "wins" ? row.winsAt : row.idolsAt;
  if (!value || !released(at ?? undefined, now)) return 0;
  return value;
}

function place(boot: string | null | undefined): number | null {
  const match = boot?.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function scoreOf(contestant: Contestant, bonusOn: boolean, now = Date.now()): number | null {
  if (!isBootPublic(contestant, now)) return null;
  const bootPlace = place(contestant.boot);
  if (bootPlace == null) return null;
  if (!bonusOn) return bootPlace;
  return bootPlace - count("idols", contestant.id, now) - count("wins", contestant.id, now);
}

export function contestant(id: string): Contestant | undefined {
  return board.contestants.find((row) => row.id === id);
}
