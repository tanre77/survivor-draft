import { managers } from "@/data/league";

export type CustomSeat = {
  id: string;
  name: string;
  picks: string[];
};

export type CustomLeague = {
  id: string;
  name: string;
  bonus: boolean;
  trades: boolean;
  drafting: boolean;
  seats: CustomSeat[];
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
        ...league,
        bonus: league.bonus === true,
        trades: league.trades === true,
        drafting: league.drafting !== false,
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

export function newId(): string {
  return crypto.randomUUID();
}

export function seatColors(name: string, index: number): { bg: string; fg: string } {
  const known = managers.find((m) => m.name.toLowerCase() === name.trim().toLowerCase());
  if (known) return { bg: known.bg, fg: known.fg };
  return PALETTE[index % PALETTE.length];
}
