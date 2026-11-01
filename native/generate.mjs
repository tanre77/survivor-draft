import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const board = JSON.parse(readFileSync(new URL("../shared/board.json", import.meta.url), "utf8"));
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

const paletteFields = [
  ["bg", "bg"],
  ["surface", "surface"],
  ["surface-2", "surface2"],
  ["fg", "fg"],
  ["muted", "muted"],
  ["line", "line"],
  ["savu", "savu"],
  ["savu-ink", "savuInk"],
  ["toka", "toka"],
  ["toka-ink", "tokaInk"],
  ["dina", "dina"],
  ["dina-ink", "dinaInk"],
  ["ember", "ember"],
  ["ember-ink", "emberInk"],
  ["boot", "boot"],
  ["boot-ink", "bootInk"],
];

function cssColors(block) {
  const colors = {};
  for (const match of block.matchAll(/--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
    colors[match[1]] = match[2].toLowerCase();
  }
  return colors;
}

function cssBlock(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`styles.css is missing ${label}`);
  return match[1];
}

const darkColors = cssColors(cssBlock(css, /@theme\s*\{([^}]*)\}/, "the @theme palette"));
const lightColors = {
  ...darkColors,
  ...cssColors(cssBlock(css, /html\[data-theme="light"\]\s*\{([^}]*)\}/, "the light theme")),
};

function paletteLiteral(name, colors) {
  const fields = paletteFields.map(([token, property]) => {
    const hex = colors[token];
    if (!hex) throw new Error(`missing --color-${token} for the ${name} palette`);
    return `        ${property}: Color(hex: "${hex}")`;
  });
  return `    static let ${name} = Palette(\n${fields.join(",\n")}\n    )`;
}

const paletteProperties = paletteFields.map(([, property]) => `    let ${property}: Color`).join("\n");

const paletteSwift = `import SwiftUI

/// Generated from src/styles.css by native/generate.mjs. Do not edit.
struct Palette {
${paletteProperties}

${paletteLiteral("dark", darkColors)}

${paletteLiteral("light", lightColors)}
}

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        let red = Double((value >> 16) & 0xFF) / 255
        let green = Double((value >> 8) & 0xFF) / 255
        let blue = Double(value & 0xFF) / 255
        self.init(red: red, green: green, blue: blue)
    }
}
`;

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
writeFileSync(new URL("Palette.swift", iosDir), paletteSwift);

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

console.log("generated BoardData.swift, Palette.swift, and android/src/data/board.ts");
