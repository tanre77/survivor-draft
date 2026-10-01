import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const board = JSON.parse(readFileSync(new URL("../shared/board.json", import.meta.url), "utf8"));

function swiftString(value) {
  return JSON.stringify(value ?? "");
}

function contestantSwift(c) {
  const boot = c.boot ? `boot: ${swiftString(c.boot)}` : "boot: nil";
  const reveal = c.revealAt ? `revealAt: ${swiftString(c.revealAt)}` : "revealAt: nil";
  return `        Contestant(id: ${swiftString(c.id)}, first: ${swiftString(c.first)}, last: ${swiftString(c.last)}, age: ${c.age}, hometown: ${swiftString(c.hometown)}, job: ${swiftString(c.job)}, tribe: ${swiftString(c.tribe)}, status: ${swiftString(c.status)}, ${boot}, ${reveal})`;
}

function managerSwift(m) {
  const picks = m.picks.map((id) => swiftString(id)).join(", ");
  return `        Manager(id: ${swiftString(m.id)}, name: ${swiftString(m.name)}, bg: ${swiftString(m.bg)}, fg: ${swiftString(m.fg)}, picks: [${picks}])`;
}

function bonusSwift(id, row) {
  const winsAt = row.winsAt ? swiftString(row.winsAt) : "nil";
  const idolsAt = row.idolsAt ? swiftString(row.idolsAt) : "nil";
  return `        ${swiftString(id)}: Bonus(idols: ${row.idols ?? 0}, wins: ${row.wins ?? 0}, winsAt: ${winsAt}, idolsAt: ${idolsAt})`;
}

const swift = `import Foundation

struct Contestant: Identifiable, Hashable {
    let id: String
    let first: String
    let last: String
    let age: Int
    let hometown: String
    let job: String
    let tribe: String
    let status: String
    let boot: String?
    let revealAt: String?
}

struct Manager: Identifiable, Hashable {
    let id: String
    let name: String
    let bg: String
    let fg: String
    let picks: [String]
}

struct Bonus: Hashable {
    let idols: Int
    let wins: Int
    let winsAt: String?
    let idolsAt: String?
}

enum BoardData {
    static let contestants: [Contestant] = [
${board.contestants.map(contestantSwift).join(",\n")}
    ]

    static let managers: [Manager] = [
${board.managers.map(managerSwift).join(",\n")}
    ]

    static let bonuses: [String: Bonus] = [
${Object.entries(board.bonuses).map(([id, row]) => bonusSwift(id, row)).join(",\n")}
    ]
}
`;

const iosDir = new URL("../ios/SurvivorDraft/Generated/", import.meta.url);
mkdirSync(iosDir, { recursive: true });
writeFileSync(new URL("BoardData.swift", iosDir), swift);

const rnDir = new URL("../android/src/data/", import.meta.url);
mkdirSync(rnDir, { recursive: true });
const normalized = {
  contestants: board.contestants.map((c) => ({
    id: c.id,
    first: c.first,
    last: c.last,
    age: c.age,
    hometown: c.hometown,
    job: c.job,
    tribe: c.tribe,
    status: c.status,
    boot: c.boot ?? null,
    revealAt: c.revealAt ?? null,
  })),
  managers: board.managers,
  bonuses: Object.fromEntries(
    board.contestants.map((c) => {
      const row = board.bonuses[c.id] ?? {};
      return [c.id, { idols: row.idols ?? 0, wins: row.wins ?? 0, winsAt: row.winsAt ?? null, idolsAt: row.idolsAt ?? null }];
    }),
  ),
  pastSeasons: board.pastSeasons,
};

writeFileSync(
  new URL("board.ts", rnDir),
  `export type Bonus = { idols: number; wins: number; winsAt: string | null; idolsAt: string | null };
export type ContestantRow = { id: string; first: string; last: string; age: number; hometown: string; job: string; tribe: string; status: string; boot: string | null; revealAt: string | null };
export type ManagerRow = { id: string; name: string; bg: string; fg: string; picks: string[] };
export const board: {
  contestants: ContestantRow[];
  managers: ManagerRow[];
  bonuses: Record<string, Bonus>;
  pastSeasons: unknown[];
} = ${JSON.stringify(normalized)};
`,
);

console.log("generated BoardData.swift and android/src/data/board.ts");
