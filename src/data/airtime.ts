const EASTERN = "America/New_York";

type Wall = { weekday: string; year: number; month: number; day: number; hour: number; minute: number };

function wall(time: number, zone: string): Wall {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(time));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    weekday: value("weekday"),
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
}

function atEastern(year: number, month: number, day: number, hour: number, minute: number): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const shown = wall(guess, EASTERN);
  const shownUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
  return guess - (shownUtc - guess);
}

/** End of the Wednesday episode: 9:30pm Eastern, a 90-minute show that starts at 8. */
export function episodeFinish(now: number): { at: number; done: boolean } {
  const here = wall(now, EASTERN);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = weekdays.indexOf(here.weekday);
  const sinceWed = (today - 3 + 7) % 7;
  const lastDay = wall(Date.UTC(here.year, here.month - 1, here.day - sinceWed, 16), EASTERN);
  const last = atEastern(lastDay.year, lastDay.month, lastDay.day, 21, 30);
  if (now < last) return { at: last, done: false };
  if (now - last < 36 * 60 * 60 * 1000) return { at: last, done: true };
  const nextDay = wall(Date.UTC(lastDay.year, lastDay.month - 1, lastDay.day + 7, 16), EASTERN);
  return { at: atEastern(nextDay.year, nextDay.month, nextDay.day, 21, 30), done: false };
}

export function episodeFinishLine(now: number): string {
  const { at, done } = episodeFinish(now);
  const when = new Date(at).toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return done ? `This week's episode finished ${when}.` : `This week's episode finishes ${when}.`;
}
