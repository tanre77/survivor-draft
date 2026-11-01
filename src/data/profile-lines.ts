import type { CustomLeague } from "./custom-leagues.ts";
import { pastSeasons } from "./history.ts";
import { contestantById, managers, pickPoints } from "./league.ts";
import { type ProfileLine } from "./profile.ts";
import { buildTable } from "./stats.ts";

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function profileLines(name: string, leagues: CustomLeague[], now = Date.now()): ProfileLine[] {
  const who = name.trim();
  if (!who) return [];
  const lines: ProfileLine[] = [];

  const live = managers.find((manager) => same(manager.name, who));
  if (live) {
    const points = live.picks.map((id) => pickPoints(contestantById(id), now));
    const total = points.reduce<number>((sum, value) => sum + (value ?? 0), 0);
    const pending = points.filter((value) => value == null).length;
    lines.push({
      id: "s51",
      where: "Survivor 51",
      detail: pending === live.picks.length ? "Still drafting the season" : `${pending} still in`,
      total: String(total),
    });
  }

  for (const league of leagues) {
    const seat = league.seats.find((row) => same(row.name, who));
    if (!seat) continue;
    const scored = seat.scores != null && seat.scores.length > 0;
    lines.push({
      id: league.id,
      where: league.name,
      detail: scored ? seat.picks.join(" · ") : league.drafting ? `${seat.picks.length} picks` : "Draft closed",
      ...(seat.place != null ? { place: seat.place } : {}),
      ...(seat.total ? { total: seat.total } : {}),
      ...(seat.prize ? { prize: seat.prize } : {}),
    });
  }

  const career = buildTable().careers.find((row) => same(row.name, who));
  if (career) {
    for (const line of career.lines) {
      const season = pastSeasons.find((row) => row.season === line.season);
      lines.push({
        id: season?.id ?? `s${line.season}`,
        where: `Season ${line.season}`,
        detail: line.picks.join(" · "),
        place: line.place,
        total: line.total,
        ...(line.prize ? { prize: line.prize } : {}),
      });
    }
  }

  return lines;
}
