export type WikiPlayer = { id: string; first: string; last: string };

export type WikiBoot = { id: string; boot: string; revealAt: string };

function ordinal(n: number): string {
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function pacificParts(now: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: value("weekday"),
    hour: Number(value("hour")),
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
  };
}

/** 11:00pm Pacific on a calendar date, as UTC. */
function pacificEleven(year: number, month: number, day: number): string {
  const guess = Date.UTC(year, month - 1, day, 23, 0, 0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(guess));
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  const shown = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour"), value("minute"));
  return new Date(guess - (shown - guess)).toISOString();
}

/** During Wednesday's broadcast, hold a new boot until 11pm Pacific. Any other time, it is already public. */
export function revealAtFor(now: number): string {
  const wall = pacificParts(now);
  if (wall.weekday === "Wed" && wall.hour >= 17 && wall.hour < 23) {
    return pacificEleven(wall.year, wall.month, wall.day);
  }
  return new Date(now - 1000).toISOString();
}

function sliceAfter(wikitext: string, name: string): string {
  const needle = `[[${name}]]`;
  const at = wikitext.indexOf(needle);
  if (at < 0) return "";
  const rest = wikitext.slice(at + needle.length);
  const next = rest.search(/\[\[[A-Za-z]/);
  return rest.slice(0, next === -1 ? 900 : Math.min(next, 900));
}

function bootFrom(slice: string): string | null {
  const voted = slice.match(/(\d+)(?:st|nd|rd|th)\s+Voted Out(?:\s|<br\s*\/?>)+Day\s+(\d+)/i);
  if (voted) return `${ordinal(Number(voted[1]))} voted out · Day ${Number(voted[2])}`;
  const quit = slice.match(/Quit(?:\s|<br\s*\/?>)+Day\s+(\d+)/i);
  if (quit) return `Quit · Day ${Number(quit[1])}`;
  const medevac = slice.match(/Medicall?y?\s+evacuated(?:\s|<br\s*\/?>)+Day\s+(\d+)/i);
  if (medevac) return `Medevac · Day ${Number(medevac[1])}`;
  if (/Sole Survivor/i.test(slice)) return "Sole Survivor";
  return null;
}

/** Pull new eliminations out of Survivor Wiki wikitext. Already-known boots are left to the caller. */
export function parseWikiBoots(wikitext: string, roster: WikiPlayer[], now = Date.now()): WikiBoot[] {
  const revealAt = revealAtFor(now);
  const boots: WikiBoot[] = [];
  for (const player of roster) {
    const name = `${player.first} ${player.last}`.trim();
    const boot = bootFrom(sliceAfter(wikitext, name));
    if (boot) boots.push({ id: player.id, boot, revealAt });
  }
  return boots;
}
