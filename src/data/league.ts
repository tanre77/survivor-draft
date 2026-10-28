export type Tribe = "savu" | "toka" | "dina";
export type Status = "active" | "out";

export type Contestant = {
  id: string;
  first: string;
  last: string;
  age: number;
  hometown: string;
  job: string;
  tribe: Tribe;
  status: Status;
  boot?: string;
  /** ISO time. A boot stays off the board until this instant so Pacific airtime is not spoiled. */
  revealAt?: string;
  aliases?: string[];
};

export type Manager = {
  id: string;
  name: string;
  bg: string;
  fg: string;
  picks: readonly [string, string, string];
};

export const contestants: Contestant[] = [
  {
    id: "aaliyah",
    first: "Aaliyah",
    last: "Puglia",
    age: 24,
    hometown: "Providence, RI",
    job: "Chef",
    tribe: "toka",
    status: "out",
    boot: "1st voted out · Day 3",
  },
  {
    id: "alexis",
    first: "Alexis",
    last: "Levine",
    age: 34,
    hometown: "Atlanta, GA",
    job: "Criminal defense attorney",
    tribe: "savu",
    status: "out",
    boot: "5th voted out · Day 10",
    revealAt: "2026-10-22T06:00:00.000Z",
  },
  {
    id: "ana",
    first: "Ana",
    last: "Sani",
    age: 34,
    hometown: "Toronto, ON",
    job: "Voice actress",
    tribe: "savu",
    status: "out",
    boot: "2nd voted out · Day 5",
    revealAt: "2026-10-01T06:00:00.000Z",
  },
  {
    id: "brady",
    first: "Brady",
    last: "Booker",
    age: 27,
    hometown: "Knoxville, TN",
    job: "Pro wrestler",
    tribe: "toka",
    status: "active",
  },
  {
    id: "carter",
    first: "Carter",
    last: "Krull",
    age: 24,
    hometown: "Sioux Falls, SD",
    job: "Livestock farmer",
    tribe: "toka",
    status: "active",
  },
  {
    id: "cristian",
    first: "Cristian",
    last: "Chavez",
    age: 25,
    hometown: "Salt Lake City, UT",
    job: "Head of HR",
    tribe: "dina",
    status: "active",
    aliases: ["christian"],
  },
  {
    id: "devin",
    first: "Devin",
    last: "Way",
    age: 33,
    hometown: "Los Angeles, CA",
    job: "Actor",
    tribe: "savu",
    status: "active",
  },
  {
    id: "eric",
    first: "Eric",
    last: "Macksoud",
    age: 34,
    hometown: "Windsor Locks, CT",
    job: "Mental health counselor",
    tribe: "dina",
    status: "active",
  },
  {
    id: "jelly",
    first: "Jelly",
    last: "Loblack",
    age: 29,
    hometown: "Bloomington, IN",
    job: "Sociology professor",
    tribe: "savu",
    status: "active",
  },
  {
    id: "jenna",
    first: "Jenna",
    last: "Doore",
    age: 30,
    hometown: "Toledo, OH",
    job: "Wedding photographer",
    tribe: "savu",
    status: "out",
    boot: "4th voted out · Day 9",
    revealAt: "2026-10-15T06:00:00.000Z",
  },
  {
    id: "kilby",
    first: "Kilby",
    last: "",
    age: 30,
    hometown: "London, ON",
    job: "Game designer",
    tribe: "dina",
    status: "active",
    aliases: ["danny"],
  },
  {
    id: "kristin",
    first: "Kristin",
    last: "Flickinger",
    age: 49,
    hometown: "Santa Barbara, CA",
    job: "Crisis management",
    tribe: "toka",
    status: "active",
  },
  {
    id: "lewis",
    first: "Lewis",
    last: "Kelly",
    age: 28,
    hometown: "Corozal, PR",
    job: "Farmer",
    tribe: "dina",
    status: "active",
  },
  {
    id: "linnea",
    first: "Linnea",
    last: "Capobianco",
    age: 25,
    hometown: "Jersey City, NJ",
    job: "Entrepreneur",
    tribe: "dina",
    status: "out",
    boot: "6th voted out · Day 10",
    revealAt: "2026-10-22T06:00:00.000Z",
  },
  {
    id: "maggie",
    first: "Maggie",
    last: "Nestor",
    age: 40,
    hometown: "Charles Town, WV",
    job: "Farmer",
    tribe: "toka",
    status: "active",
  },
  {
    id: "mike",
    first: "Mike",
    last: "Pinsky",
    age: 32,
    hometown: "New York, NY",
    job: "Baseball executive",
    tribe: "toka",
    status: "active",
  },
  {
    id: "ori",
    first: "Ori",
    last: "Jean-Charles",
    age: 27,
    hometown: "Spring Valley, NY",
    job: "Personal trainer",
    tribe: "savu",
    status: "active",
  },
  {
    id: "patt",
    first: "Patt",
    last: "Cannaday",
    age: 33,
    hometown: "Washington, D.C.",
    job: "Federal prosecutor",
    tribe: "toka",
    status: "out",
    boot: "3rd voted out · Day 7",
    revealAt: "2026-10-08T06:00:00.000Z",
  },
  {
    id: "rob",
    first: "Rob",
    last: "Antonson",
    age: 40,
    hometown: "Cumberland, RI",
    job: "Airline gate agent",
    tribe: "savu",
    status: "out",
    boot: "19th place · Quit · Day 6",
    revealAt: "2026-10-08T06:00:00.000Z",
  },
  {
    id: "sharonda",
    first: "Sharonda",
    last: "Cox",
    age: 34,
    hometown: "Richmond, KY",
    job: "OB/GYN resident",
    tribe: "dina",
    status: "active",
  },
  {
    id: "thien-an",
    first: "Thien An",
    last: "Nguyen",
    age: 24,
    hometown: "Fort Worth, TX",
    job: "Medical student",
    tribe: "toka",
    status: "active",
    aliases: ["an", "nguyen", "thien"],
  },
];

/** Sheet order, top to bottom. Pick 3s are the handwritten round. */
export const managers: Manager[] = [
  { id: "rick", name: "Rick", bg: "#8fb56a", fg: "#1a140e", picks: ["mike", "brady", "devin"] },
  { id: "robbie", name: "Robbie", bg: "#f4efe6", fg: "#1a140e", picks: ["jelly", "devin", "alexis"] },
  { id: "kris", name: "Kris", bg: "#d11378", fg: "#fff6fb", picks: ["jenna", "sharonda", "thien-an"] },
  { id: "elise", name: "Elise", bg: "#c9eef2", fg: "#1a140e", picks: ["jelly", "brady", "maggie"] },
  { id: "jared", name: "Jared", bg: "#d5e15a", fg: "#1a140e", picks: ["thien-an", "lewis", "sharonda"] },
  { id: "luke", name: "Luke", bg: "#6d46b8", fg: "#f7f2ff", picks: ["lewis", "brady", "maggie"] },
  { id: "kirt", name: "Kirt", bg: "#2f6fed", fg: "#f3f7ff", picks: ["alexis", "maggie", "linnea"] },
  { id: "lauren", name: "Lauren", bg: "#d2c2f7", fg: "#1a140e", picks: ["jenna", "sharonda", "kilby"] },
  { id: "erin", name: "Erin", bg: "#f7c2da", fg: "#1a140e", picks: ["ori", "mike", "carter"] },
  { id: "shelly", name: "Shelly", bg: "#6b46b0", fg: "#f7f2ff", picks: ["lewis", "rob", "devin"] },
  { id: "josh", name: "Josh", bg: "#8d7362", fg: "#f8f3ec", picks: ["brady", "linnea", "patt"] },
  { id: "jacob", name: "Jacob G", bg: "#2f8a3c", fg: "#f3fff4", picks: ["ori", "lewis", "thien-an"] },
  { id: "grandma", name: "Grandma", bg: "#f4efe6", fg: "#1a140e", picks: ["jelly", "mike", "alexis"] },
  { id: "robin", name: "Robin", bg: "#1c8a34", fg: "#f3fff5", picks: ["jenna", "linnea", "ana"] },
  { id: "dom", name: "Dom", bg: "#1d4ed8", fg: "#f3f7ff", picks: ["jenna", "ori", "alexis"] },
  { id: "haley", name: "Haley", bg: "#f0d429", fg: "#1a140e", picks: ["kilby", "rob", "eric"] },
  { id: "kiana", name: "Kiana", bg: "#d32222", fg: "#fff5f5", picks: ["linnea", "jelly", "ana"] },
  { id: "keegan", name: "Keegan", bg: "#f4efe6", fg: "#1a140e", picks: ["mike", "rob", "thien-an"] },
  { id: "ryan", name: "Ryan", bg: "#8ceaf6", fg: "#1a140e", picks: ["carter", "kristin", "patt"] },
  { id: "tivin", name: "Tivin", bg: "#c2410c", fg: "#fff6f1", picks: ["sharonda", "kristin", "devin"] },
  { id: "tanner", name: "Tanner", bg: "#e4c48a", fg: "#1a140e", picks: ["rob", "maggie", "kilby"] },
  { id: "jen", name: "Jen", bg: "#9333ea", fg: "#fbf7ff", picks: ["kilby", "kristin", "carter"] },
  { id: "jenna-m", name: "Jenna", bg: "#e0ae2a", fg: "#1a140e", picks: ["ori", "kristin", "patt"] },
];

const byContestant = new Map(contestants.map((c) => [c.id, c]));
const byManager = new Map(managers.map((m) => [m.id, m]));

export function contestantById(id: string): Contestant {
  const found = byContestant.get(id);
  if (!found) throw new Error(`Unknown contestant: ${id}`);
  return found;
}

export function managerById(id: string): Manager | null {
  return byManager.get(id) ?? null;
}

export function photoSrc(id: string): string {
  return `/cast/${id}.jpg`;
}

/** Idols found, advantages, successful plays, challenge wins, and final-tribal votes. A reveal time stays hidden until 11:00 PM Pacific. */
export const bonuses: Record<
  string,
  {
    idols?: number;
    advantages?: number;
    plays?: number;
    wins?: number;
    votes?: number;
    winsAt?: string;
    idolsAt?: string;
    advantagesAt?: string;
    playsAt?: string;
    votesAt?: string;
  }
> = {
  alexis: { wins: 2, winsAt: "2026-10-08T06:00:00.000Z" },
  ana: { wins: 1 },
  brady: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  carter: { wins: 2, winsAt: "2026-10-15T06:00:00.000Z" },
  cristian: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  eric: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  kristin: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  linnea: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  ori: { wins: 2, winsAt: "2026-10-08T06:00:00.000Z" },
  rob: { idols: 1, wins: 1 },
  sharonda: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  devin: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  jelly: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  jenna: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  kilby: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  lewis: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  maggie: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  mike: { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
  patt: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  "thien-an": { wins: 3, winsAt: "2026-10-15T06:00:00.000Z" },
};

function released(at: string | undefined, now: number): boolean {
  if (!at) return true;
  const time = Date.parse(at);
  return Number.isFinite(time) && now >= time;
}

export function isBootPublic(c: Contestant, now = Date.now()): boolean {
  if (c.status !== "out") return false;
  return released(c.revealAt, now);
}

export function idolCount(c: Contestant, now = Date.now()): number {
  const row = bonuses[c.id];
  if (!row?.idols || !released(row.idolsAt, now)) return 0;
  return row.idols;
}

export function advantageCount(c: Contestant, now = Date.now()): number {
  const row = bonuses[c.id];
  if (!row?.advantages || !released(row.advantagesAt, now)) return 0;
  return row.advantages;
}

export function playCount(c: Contestant, now = Date.now()): number {
  const row = bonuses[c.id];
  if (!row?.plays || !released(row.playsAt, now)) return 0;
  return row.plays;
}

export function winCount(c: Contestant, now = Date.now()): number {
  const row = bonuses[c.id];
  if (!row?.wins || !released(row.winsAt, now)) return 0;
  return row.wins;
}

export function voteCount(c: Contestant, now = Date.now()): number {
  const row = bonuses[c.id];
  if (!row?.votes || !released(row.votesAt, now)) return 0;
  return row.votes;
}

/** Advanced only. Finding an idol or advantage is 2, a successful play is 5, an immunity win is 1, a final-tribal vote is 1. */
export function advancedBonus(c: Contestant, now = Date.now()): number {
  return (idolCount(c, now) + advantageCount(c, now)) * 2 + playCount(c, now) * 5 + winCount(c, now) + voteCount(c, now);
}

/** First six boots are pre-jury in advanced scoring. Standard scoring ignores that line. */
export const PRE_JURY_BOOTS = 6;

export function pointsForPlace(place: number, castSize: number, advanced = false): number {
  if (!advanced) return place;
  const preJury = Math.min(PRE_JURY_BOOTS, Math.max(0, castSize - 1));
  const juryCount = castSize - preJury;
  if (place <= juryCount) return place;
  return juryCount + (place - juryCount) * 2;
}

export function finishPoints(boot: string | undefined, castSize = contestants.length, advanced = false): number | null {
  if (!boot) return null;
  const text = boot.toLowerCase();
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

/** Lowest total is 1st. A matching total goes to the better finish, then the next pick. A true tie shares the place. */
export function compareStandings(
  a: { total: number; picks: readonly string[] },
  b: { total: number; picks: readonly string[] },
  now = Date.now(),
): number {
  if (a.total !== b.total) return a.total - b.total;
  const order = (picks: readonly string[]) =>
    picks
      .map((id) => pickPoints(contestantById(id), now) ?? Number.POSITIVE_INFINITY)
      .sort((left, right) => left - right);
  const af = order(a.picks);
  const bf = order(b.picks);
  const count = Math.max(af.length, bf.length);
  for (let i = 0; i < count; i += 1) {
    const av = af[i] ?? Number.POSITIVE_INFINITY;
    const bv = bf[i] ?? Number.POSITIVE_INFINITY;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/** Lowest total is 1st. Ties share a place, and the next place skips. */
export function standingPlace(total: number, totals: number[]): number {
  return totals.filter((score) => score < total).length + 1;
}

export function ordinal(place: number): string {
  const mod = place % 100;
  if (mod >= 11 && mod <= 13) return `${place}th`;
  if (place % 10 === 1) return `${place}st`;
  if (place % 10 === 2) return `${place}nd`;
  if (place % 10 === 3) return `${place}rd`;
  return `${place}th`;
}
export function pickPoints(c: Contestant, now = Date.now()): number | null {
  if (!isBootPublic(c, now)) return null;
  return finishPoints(c.boot);
}

export function bonusOf(c: Contestant): number {
  return idolCount(c) + winCount(c);
}

export type TribalVote = {
  voter: string;
  for: string | null;
  note?: "shot" | "exile";
};

export type Tribal = {
  day: number;
  tribe: Tribe;
  boot: string;
  tally: string;
  revealAt?: string;
  votes: TribalVote[];
};

/** Hidden until 11:00 PM Pacific, same as the boot they decide. */
export const tribals: Tribal[] = [
  {
    day: 3,
    tribe: "toka",
    boot: "aaliyah",
    tally: "6–2",
    votes: [
      { voter: "brady", for: "aaliyah" },
      { voter: "kilby", for: "aaliyah" },
      { voter: "maggie", for: "aaliyah" },
      { voter: "mike", for: "aaliyah" },
      { voter: "patt", for: "aaliyah" },
      { voter: "thien-an", for: "aaliyah" },
      { voter: "devin", for: "jenna" },
      { voter: "jelly", for: "jenna" },
      { voter: "aaliyah", for: null, note: "shot" },
      { voter: "jenna", for: null, note: "shot" },
      { voter: "lewis", for: null, note: "exile" },
    ],
  },
  {
    day: 5,
    tribe: "savu",
    boot: "ana",
    tally: "6–4",
    revealAt: "2026-10-01T06:00:00.000Z",
    votes: [
      { voter: "alexis", for: "ana" },
      { voter: "cristian", for: "ana" },
      { voter: "eric", for: "ana" },
      { voter: "kristin", for: "ana" },
      { voter: "linnea", for: "ana" },
      { voter: "sharonda", for: "ana" },
      { voter: "ana", for: "eric" },
      { voter: "carter", for: "eric" },
      { voter: "ori", for: "eric" },
      { voter: "rob", for: "eric" },
    ],
  },
  {
    day: 7,
    tribe: "toka",
    boot: "patt",
    tally: "6–5",
    revealAt: "2026-10-08T06:00:00.000Z",
    votes: [
      { voter: "carter", for: "patt" },
      { voter: "jenna", for: "patt" },
      { voter: "kilby", for: "patt" },
      { voter: "lewis", for: "patt" },
      { voter: "maggie", for: "patt" },
      { voter: "thien-an", for: "patt" },
      { voter: "brady", for: "kilby" },
      { voter: "devin", for: "kilby" },
      { voter: "jelly", for: "kilby" },
      { voter: "mike", for: "kilby" },
      { voter: "patt", for: "kilby" },
    ],
  },
  {
    day: 9,
    tribe: "savu",
    boot: "jenna",
    tally: "4–1",
    revealAt: "2026-10-15T06:00:00.000Z",
    votes: [
      { voter: "alexis", for: "jenna" },
      { voter: "devin", for: "jenna" },
      { voter: "jelly", for: "jenna" },
      { voter: "ori", for: "jenna" },
      { voter: "jenna", for: "alexis" },
    ],
  },
  {
    day: 10,
    tribe: "savu",
    boot: "alexis",
    tally: "3–1",
    revealAt: "2026-10-22T06:00:00.000Z",
    votes: [
      { voter: "devin", for: "alexis" },
      { voter: "jelly", for: "alexis" },
      { voter: "ori", for: "alexis" },
      { voter: "alexis", for: "devin" },
    ],
  },
  {
    day: 10,
    tribe: "dina",
    boot: "linnea",
    tally: "4–4, then 4–0",
    revealAt: "2026-10-22T06:00:00.000Z",
    votes: [
      { voter: "cristian", for: "linnea" },
      { voter: "eric", for: "linnea" },
      { voter: "kilby", for: "linnea" },
      { voter: "sharonda", for: "linnea" },
      { voter: "linnea", for: "lewis" },
    ],
  },
];

export function visibleTribals(now = Date.now()): Tribal[] {
  return tribals.filter((tribal) => released(tribal.revealAt, now));
}

export function votingRecord(id: string, now = Date.now()) {
  return visibleTribals(now).flatMap((tribal) => {
    const mine = tribal.votes.find((vote) => vote.voter === id);
    const against = tribal.votes.filter((vote) => vote.for === id).map((vote) => vote.voter);
    if (!mine && against.length === 0) return [];
    return [{ tribal, mine, against }];
  });
}

export function ownersOf(contestantId: string): Manager[] {
  return managers.filter((m) => m.picks.includes(contestantId));
}

export function pickIndex(manager: Manager, contestantId: string): number {
  return manager.picks.indexOf(contestantId);
}

export function displayName(c: Contestant): string {
  if (c.id === "kilby") return "Danny Kilby";
  return `${c.first} ${c.last}`.trim();
}

export function contestantByName(name: string): Contestant | null {
  const q = name.trim().toLowerCase();
  if (!q) return null;
  return (
    contestants.find((c) => {
      const names = [c.first, c.last, displayName(c), c.id, ...(c.aliases ?? [])].map((part) => part.toLowerCase());
      return names.includes(q);
    }) ?? null
  );
}

export function contestantBlob(c: Contestant): string {
  return [c.first, c.last, c.job, c.hometown, c.tribe, displayName(c), ...(c.aliases ?? [])]
    .join(" ")
    .toLowerCase();
}

export function nameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export const SEAT_KEY = "s51-draft-seat";
