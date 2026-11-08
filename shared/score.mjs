/** Lowest score wins. Early boots are worth the most. The sole survivor is 1. Idols and wins subtract only when a league opted in. */

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

/** 1st voted out of 21 is 21 on standard. Advanced makes the first six boots pre-jury, two points apart, then the jury one point apart. The winner is 1 either way. */
export function pointsForPlace(place, castSize, advanced = false) {
  if (!advanced) return place;
  const preJury = Math.min(6, Math.max(0, castSize - 1));
  const juryCount = castSize - preJury;
  if (place <= juryCount) return place;
  return juryCount + (place - juryCount) * 2;
}

export function finishPoints(boot, castSize, advanced = false) {
  if (!boot) return null;
  const text = String(boot).toLowerCase();
  const placed = text.match(/(\d+)(?:st|nd|rd|th) place/);
  if (placed) {
    const n = Number(placed[1]);
    const place = (n === 3 && /finalist|final tribal/.test(text)) || /tie for second|tied for 2nd/.test(text) ? 2 : n;
    return Math.max(0, pointsForPlace(place, castSize, advanced));
  }
  if (/quit|medevac|medical|evacuat/.test(text)) return 0;
  if (/sole survivor|\bwinner\b/.test(text)) return 1;
  if (/runner-?up/.test(text)) return pointsForPlace(2, castSize, advanced);
  const match = text.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  const place = /place|finalist/.test(text) && !/voted out|eliminat/.test(text) ? n : castSize - n + 1;
  return Math.max(0, pointsForPlace(place, castSize, advanced));
}

export function scoreOf(contestant, bonuses, now, bonusOn, castSize, advanced = false) {
  if (!isBootPublic(contestant, now)) return null;
  const place = finishPoints(contestant.boot, castSize, advanced);
  if (place == null) return null;
  if (!bonusOn) return place;
  return place - idolCount(contestant, bonuses, now) - winCount(contestant, bonuses, now);
}

export function teamScore(picks, contestants, bonuses, now, bonusOn) {
  const byId = new Map(contestants.map((c) => [c.id, c]));
  const castSize = contestants.length;
  let total = 0;
  let pending = 0;
  for (const id of picks) {
    const contestant = byId.get(id);
    if (!contestant) continue;
    const score = scoreOf(contestant, bonuses, now, bonusOn, castSize);
    if (score == null) pending += 1;
    else total += score;
  }
  return { total, pending };
}

export function bootDay(boot) {
  const match = String(boot ?? "").match(/day\s+(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function votedOutOrder(boot) {
  const match = String(boot ?? "").match(/(\d+)(?:st|nd|rd|th)\s+voted out/i);
  return match ? Number(match[1]) : 0;
}

/** People who left on the latest public night. A quit's finish place does not outrank a later vote. */
export function latestPublicBoots(contestants, now) {
  const gone = contestants.filter((contestant) => isBootPublic(contestant, now) && bootDay(contestant.boot) > 0);
  const day = Math.max(0, ...gone.map((contestant) => bootDay(contestant.boot)));
  return gone
    .filter((contestant) => bootDay(contestant.boot) === day)
    .sort((a, b) => votedOutOrder(a.boot) - votedOutOrder(b.boot));
}
