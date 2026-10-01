export type Tribe = "savu" | "toka";
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
    status: "active",
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
    tribe: "savu",
    status: "active",
  },
  {
    id: "cristian",
    first: "Cristian",
    last: "Chavez",
    age: 25,
    hometown: "Salt Lake City, UT",
    job: "Head of HR",
    tribe: "savu",
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
    tribe: "toka",
    status: "active",
  },
  {
    id: "eric",
    first: "Eric",
    last: "Macksoud",
    age: 34,
    hometown: "Windsor Locks, CT",
    job: "Mental health counselor",
    tribe: "savu",
    status: "active",
  },
  {
    id: "jelly",
    first: "Jelly",
    last: "Loblack",
    age: 29,
    hometown: "Bloomington, IN",
    job: "Sociology professor",
    tribe: "toka",
    status: "active",
  },
  {
    id: "jenna",
    first: "Jenna",
    last: "Doore",
    age: 30,
    hometown: "Toledo, OH",
    job: "Wedding photographer",
    tribe: "toka",
    status: "active",
  },
  {
    id: "kilby",
    first: "Kilby",
    last: "",
    age: 30,
    hometown: "London, ON",
    job: "Game designer",
    tribe: "toka",
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
    tribe: "savu",
    status: "active",
  },
  {
    id: "lewis",
    first: "Lewis",
    last: "Kelly",
    age: 28,
    hometown: "Corozal, PR",
    job: "Farmer",
    tribe: "toka",
    status: "active",
  },
  {
    id: "linnea",
    first: "Linnea",
    last: "Capobianco",
    age: 25,
    hometown: "Jersey City, NJ",
    job: "Entrepreneur",
    tribe: "savu",
    status: "active",
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
    status: "active",
  },
  {
    id: "rob",
    first: "Rob",
    last: "Antonson",
    age: 40,
    hometown: "Cumberland, RI",
    job: "Airline gate agent",
    tribe: "savu",
    status: "active",
  },
  {
    id: "sharonda",
    first: "Sharonda",
    last: "Cox",
    age: 34,
    hometown: "Richmond, KY",
    job: "OB/GYN resident",
    tribe: "savu",
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

/** Idols found and challenge wins. Counts with a reveal time stay hidden until 11:00 PM Pacific. */
export const bonuses: Record<string, { idols?: number; wins?: number; winsAt?: string; idolsAt?: string }> = {
  alexis: { wins: 1 },
  ana: { wins: 1 },
  carter: { wins: 1 },
  cristian: { wins: 1 },
  eric: { wins: 1 },
  kristin: { wins: 1 },
  linnea: { wins: 1 },
  ori: { wins: 1 },
  rob: { idols: 1, wins: 1 },
  sharonda: { wins: 1 },
  brady: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  devin: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  jelly: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  jenna: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  kilby: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  lewis: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  maggie: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  mike: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  patt: { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
  "thien-an": { wins: 2, winsAt: "2026-10-01T06:00:00.000Z" },
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

export function winCount(c: Contestant, now = Date.now()): number {
  const row = bonuses[c.id];
  if (!row?.wins || !released(row.winsAt, now)) return 0;
  return row.wins;
}

export function bonusOf(c: Contestant): number {
  return idolCount(c) + winCount(c);
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
