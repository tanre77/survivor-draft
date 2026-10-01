import { managers } from "@/data/league";

export type CustomSeat = {
  id: string;
  name: string;
  picks: string[];
  scores?: number[];
  total?: string;
  prize?: string;
  place?: number;
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
        id: typeof league.id === "string" ? league.id : newId(),
        name: league.name,
        bonus: league.bonus === true,
        trades: league.trades === true,
        drafting: league.drafting !== false,
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

export function newId(): string {
  return crypto.randomUUID();
}

export function seatColors(name: string, index: number): { bg: string; fg: string } {
  const known = managers.find((m) => m.name.toLowerCase() === name.trim().toLowerCase());
  if (known) return { bg: known.bg, fg: known.fg };
  return PALETTE[index % PALETTE.length];
}
