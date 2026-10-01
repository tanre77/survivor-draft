/** Lowest score wins. A boot is worth its place. Idols and wins subtract only when a league opted in. */

export function released(at, now) {
  if (!at) return true;
  const time = Date.parse(at);
  return Number.isFinite(time) && now >= time;
}

export function isBootPublic(contestant, now) {
  return contestant.status === "out" && released(contestant.revealAt, now);
}

export function idolCount(contestant, bonuses, now) {
  const row = bonuses[contestant.id];
  if (!row?.idols || !released(row.idolsAt, now)) return 0;
  return row.idols;
}

export function winCount(contestant, bonuses, now) {
  const row = bonuses[contestant.id];
  if (!row?.wins || !released(row.winsAt, now)) return 0;
  return row.wins;
}

export function displayName(contestant) {
  if (contestant.id === "kilby") return "Danny Kilby";
  return `${contestant.first} ${contestant.last}`.trim();
}

export function scoreOf(contestant, bonuses, now, bonusOn) {
  if (!isBootPublic(contestant, now)) return null;
  const place = bootPlace(contestant.boot);
  if (place == null) return null;
  if (!bonusOn) return place;
  return place - idolCount(contestant, bonuses, now) - winCount(contestant, bonuses, now);
}

function bootPlace(boot) {
  if (!boot) return null;
  const match = boot.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function teamScore(picks, contestants, bonuses, now, bonusOn) {
  const byId = new Map(contestants.map((c) => [c.id, c]));
  let total = 0;
  let pending = 0;
  for (const id of picks) {
    const contestant = byId.get(id);
    if (!contestant) continue;
    const score = scoreOf(contestant, bonuses, now, bonusOn);
    if (score == null) pending += 1;
    else total += score;
  }
  return { total, pending };
}
