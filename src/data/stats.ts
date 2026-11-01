import { pastSeasons, rosterFor, type PastSeason } from "./history.ts";

export type SlotStat = {
  slot: number;
  average: number;
  samples: number;
  timesBest: number;
  winnerAverage: number;
  timesWinnerBest: number;
};

export type SeasonLine = {
  season: number;
  place: number;
  total: string;
  prize?: string;
  picks: readonly string[];
  scores: readonly number[];
  bestSlot: number;
};

export type Career = {
  name: string;
  seasons: number;
  wins: number;
  podiums: number;
  best: number;
  avgPlace: number;
  avgScore: number;
  money: number;
  bestSlot: number;
  lines: SeasonLine[];
};

export type TableReport = {
  seasons: number[];
  rosters: number;
  slots: SlotStat[];
  careers: Career[];
};

export function totalNumber(total: string): number {
  const match = total.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

/** Plus beats a plain tie, which beats a minus. Lowest score still wins. */
export function totalRank(total: string | undefined): number {
  if (!total) return Number.POSITIVE_INFINITY;
  const value = totalNumber(total);
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  const mark = total.includes("+") ? -0.2 : /[−-]/.test(total) ? 0.2 : 0;
  return value + mark;
}

function bestSlot(scores: readonly number[]): number {
  let best = 0;
  scores.forEach((score, index) => {
    if (score < scores[best]) best = index;
  });
  return best + 1;
}

function moneyOf(prize?: string): number {
  if (!prize) return 0;
  const match = prize.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function slotStats(seasons: readonly PastSeason[]): SlotStat[] {
  const count = Math.max(...seasons.flatMap((season) => season.standings.map((row) => row.scores.length)));
  const slots: SlotStat[] = Array.from({ length: count }, (_, index) => ({
    slot: index + 1,
    average: 0,
    samples: 0,
    timesBest: 0,
    winnerAverage: 0,
    timesWinnerBest: 0,
  }));
  const sum = Array.from({ length: count }, () => 0);
  const winSum = Array.from({ length: count }, () => 0);
  const winN = Array.from({ length: count }, () => 0);

  for (const season of seasons) {
    for (const row of season.standings) {
      row.scores.forEach((score, index) => {
        sum[index] += score;
        slots[index].samples += 1;
      });
      const cheap = bestSlot(row.scores);
      const tied = row.scores.filter((score) => score === row.scores[cheap - 1]).length;
      if (tied === 1) slots[cheap - 1].timesBest += 1;
    }
    const winner = season.standings.find((row) => row.place === 1);
    if (!winner) continue;
    winner.scores.forEach((score, index) => {
      winSum[index] += score;
      winN[index] += 1;
    });
    const cheap = bestSlot(winner.scores);
    const tied = winner.scores.filter((score) => score === winner.scores[cheap - 1]).length;
    if (tied === 1) slots[cheap - 1].timesWinnerBest += 1;
  }

  return slots.map((slot, index) => ({
    ...slot,
    average: slot.samples ? sum[index] / slot.samples : 0,
    winnerAverage: winN[index] ? winSum[index] / winN[index] : 0,
  }));
}

function careersOf(seasons: readonly PastSeason[]): Career[] {
  const map = new Map<string, Career>();
  for (const season of seasons) {
    for (const row of season.standings) {
      const roster = rosterFor(season, row.name);
      const current = map.get(row.name) ?? {
        name: row.name,
        seasons: 0,
        wins: 0,
        podiums: 0,
        best: row.place,
        avgPlace: 0,
        avgScore: 0,
        money: 0,
        bestSlot: 1,
        lines: [],
      };
      current.seasons += 1;
      if (row.place === 1) current.wins += 1;
      if (row.place <= 3) current.podiums += 1;
      current.best = Math.min(current.best, row.place);
      current.money += moneyOf(row.prize);
      current.lines.push({
        season: season.season,
        place: row.place,
        total: row.total,
        prize: row.prize,
        picks: roster?.picks ?? [],
        scores: row.scores,
        bestSlot: bestSlot(row.scores),
      });
      map.set(row.name, current);
    }
  }

  return [...map.values()]
    .map((career) => {
      const places = career.lines.reduce((sum, line) => sum + line.place, 0);
      const scores = career.lines.reduce((sum, line) => sum + totalNumber(line.total), 0);
      const slotSum = [0, 0, 0, 0];
      const slotN = [0, 0, 0, 0];
      for (const line of career.lines) {
        line.scores.forEach((score, index) => {
          if (index > 3) return;
          slotSum[index] += score;
          slotN[index] += 1;
        });
      }
      let best = 0;
      slotN.forEach((count, index) => {
        if (!count) return;
        const avg = slotSum[index] / count;
        const bestAvg = slotN[best] ? slotSum[best] / slotN[best] : Number.POSITIVE_INFINITY;
        if (avg < bestAvg) best = index;
      });
      career.lines.sort((a, b) => b.season - a.season);
      return {
        ...career,
        avgPlace: places / career.seasons,
        avgScore: scores / career.seasons,
        bestSlot: best + 1,
      };
    })
    .sort((a, b) => b.wins - a.wins || a.avgPlace - b.avgPlace || a.name.localeCompare(b.name));
}

export function buildTable(seasons: readonly PastSeason[] = pastSeasons): TableReport {
  return {
    seasons: seasons.map((season) => season.season),
    rosters: seasons.reduce((sum, season) => sum + season.standings.length, 0),
    slots: slotStats(seasons),
    careers: careersOf(seasons),
  };
}

export function placeLabel(place: number): string {
  const mod100 = place % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${place}th`;
  if (place % 10 === 1) return `${place}st`;
  if (place % 10 === 2) return `${place}nd`;
  if (place % 10 === 3) return `${place}rd`;
  return `${place}th`;
}
