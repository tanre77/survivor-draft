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

function pointsForPlace(place: number, castSize: number, advanced: boolean): number {
  if (!advanced) return place;
  const preJury = Math.min(6, Math.max(0, castSize - 1));
  const juryCount = castSize - preJury;
  if (place <= juryCount) return place;
  return juryCount + (place - juryCount) * 2;
}

function finishPoints(boot: string | null | undefined, castSize: number, advanced = false): number | null {
  if (!boot) return null;
  const text = boot.toLowerCase();
  if (/quit|medevac|medical|evacuat/.test(text)) return 0;
  if (/sole survivor|\bwinner\b/.test(text)) return 1;
  if (/runner-?up/.test(text)) return pointsForPlace(2, castSize, advanced);
  const match = text.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  const place = /place|finalist/.test(text) && !/voted out|eliminat/.test(text) ? n : castSize - n + 1;
  return Math.max(0, pointsForPlace(place, castSize, advanced));
}

export function scoreOf(contestant: Contestant, bonusOn: boolean, now = Date.now()): number | null {
  if (!isBootPublic(contestant, now)) return null;
  const points = finishPoints(contestant.boot, board.contestants.length);
  if (points == null) return null;
  if (!bonusOn) return points;
  return points - count("idols", contestant.id, now) - count("wins", contestant.id, now);
}

export function contestant(id: string): Contestant | undefined {
  return board.contestants.find((row) => row.id === id);
}
