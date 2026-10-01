export type ImportedSeat = {
  name: string;
  picks: string[];
  scores?: number[];
  total?: string;
  prize?: string;
  place?: number;
};

export type ImportedSheet = {
  name: string;
  source: string;
  seats: ImportedSeat[];
  scored: boolean;
  season?: number;
};

function text(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function label(value: string): string {
  return value.replace(/:$/, "").trim();
}

function isName(value: string): boolean {
  return /^name$/i.test(label(value));
}

function isPick(value: string): boolean {
  return /^pick\s*\d+$/i.test(label(value));
}

function scoreNum(value: string): number | null {
  if (!value || !/^-?\d+(?:\.\d+)?$/.test(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function totalText(value: string): string | undefined {
  if (!value) return undefined;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    const number = Number(value);
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 10) / 10);
  }
  return value;
}

function prizeText(value: string): string | undefined {
  if (!value || value === "✓" || value === "✔") return undefined;
  if (value.startsWith("$")) return value;
  const number = scoreNum(value);
  if (number != null && number > 0) return `$${Math.round(number)}`;
  return undefined;
}

function seasonNumber(name: string): number | undefined {
  const match = name.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function titleFrom(rows: string[][], sheetName: string): string {
  for (const row of rows.slice(0, 8)) {
    for (const cell of row) {
      const match = cell.match(/survivor\s*(\d+)/i);
      if (match) return `Season ${match[1]}`;
    }
  }
  const short = sheetName.match(/^s(\d+)$/i);
  if (short) return `Season ${short[1]}`;
  return sheetName.trim() || "Imported league";
}

type Header = {
  row: number;
  rosterName: number;
  pickCols: number[];
  standName: number;
  scoreCols: number[];
  totalCol: number;
  prizeCol: number;
  placeCol: number;
};

function headerOf(rows: string[][]): Header | null {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const names = row.map((cell, index) => (isName(cell) ? index : -1)).filter((index) => index >= 0);
    let rosterName = -1;
    let pickCols: number[] = [];
    for (const index of names) {
      const picks: number[] = [];
      for (let column = index + 1; column < row.length; column += 1) {
        if (isPick(row[column])) picks.push(column);
        else if (picks.length) break;
      }
      if (picks.length) {
        rosterName = index;
        pickCols = picks;
        break;
      }
    }
    if (rosterName < 0) continue;
    const totalCol = row.findIndex((cell) => /^total$/i.test(label(cell)));
    const prizeCol = row.findIndex((cell) => /^prizes?$|^\$+$/i.test(label(cell)));
    const standName = names.find((index) => index !== rosterName) ?? -1;
    const scoreCols: number[] = [];
    if (standName >= 0 && totalCol > standName) {
      for (let column = standName + 1; column < totalCol; column += 1) {
        if (/^#$/.test(label(row[column]))) continue;
        if (/^points?$/i.test(label(row[column])) || row[column] === "") scoreCols.push(column);
      }
    }
    const placeCol = row.findIndex((cell) => label(cell) === "#");
    return { row: rowIndex, rosterName, pickCols, standName, scoreCols, totalCol, prizeCol, placeCol };
  }
  return null;
}

export function parseGrid(rows: unknown[][], sheetName = "League"): ImportedSheet | null {
  const grid = rows.map((row) => (Array.isArray(row) ? row.map((cell) => text(cell)) : []));
  const header = headerOf(grid);
  if (!header) return null;

  const byName = new Map<string, ImportedSeat>();
  const order: string[] = [];

  function seat(name: string): ImportedSeat {
    const key = name.toLowerCase();
    const existing = byName.get(key);
    if (existing) return existing;
    const created: ImportedSeat = { name, picks: [] };
    byName.set(key, created);
    order.push(key);
    return created;
  }

  for (let index = header.row + 1; index < grid.length; index += 1) {
    const row = grid[index];
    const name = row[header.rosterName] ?? "";
    if (!name || isName(name) || /^cast$/i.test(name)) break;
    const picks = header.pickCols.map((column) => row[column] ?? "").filter(Boolean);
    if (!picks.length) continue;
    seat(name).picks = picks;
  }

  if (header.standName >= 0) {
    for (let index = header.row + 1; index < grid.length; index += 1) {
      const row = grid[index];
      const name = row[header.standName] ?? "";
      if (!name || isName(name)) {
        if (index > header.row + 1) break;
        continue;
      }
      const person = seat(name);
      const scores = header.scoreCols.map((column) => scoreNum(row[column] ?? "")).filter((score): score is number => score != null);
      if (scores.length) person.scores = scores.slice(0, Math.max(person.picks.length, scores.length));
      const total = header.totalCol >= 0 ? totalText(row[header.totalCol] ?? "") : undefined;
      if (total) person.total = total;
      const labeled = header.prizeCol >= 0 ? prizeText(row[header.prizeCol] ?? "") : undefined;
      const beside = header.totalCol >= 0 ? prizeText(row[header.totalCol + 1] ?? "") : undefined;
      const prize = labeled ?? beside;
      if (prize) person.prize = prize;
      const place = header.placeCol >= 0 ? scoreNum(row[header.placeCol] ?? "") : null;
      if (place != null) person.place = place;
    }
  }

  const seats = order.map((key) => byName.get(key)).filter((person): person is ImportedSeat => person != null && (person.picks.length > 0 || person.total != null));
  if (seats.length < 2) return null;

  const scored = seats.some((person) => person.scores != null && person.scores.length > 0);
  if (scored && seats.some((person) => person.place == null && person.total)) {
    const ranked = [...seats].sort((a, b) => totalRank(a.total) - totalRank(b.total));
    ranked.forEach((person, index) => {
      if (person.place == null) person.place = index + 1;
    });
  }

  const name = titleFrom(grid, sheetName);
  return { name, source: sheetName, seats, scored, season: seasonNumber(name) };
}

function totalRank(total: string | undefined): number {
  if (!total) return Number.POSITIVE_INFINITY;
  const match = total.match(/-?\d+(?:\.\d+)?/);
  if (!match) return Number.POSITIVE_INFINITY;
  const mark = total.includes("+") ? -0.2 : /[−-]/.test(total) ? 0.2 : 0;
  return Number(match[0]) + mark;
}

export function parseCsv(source: string, name = "Pasted league"): ImportedSheet | null {
  const rows = source
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => splitCsv(line));
  return parseGrid(rows, name);
}

function splitCsv(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);
  return cells;
}

export async function parseWorkbook(buffer: ArrayBuffer, fallbackName = "Imported league"): Promise<ImportedSheet[]> {
  const XLSX = await import("xlsx");
  const book = XLSX.read(buffer, { type: "array" });
  const found: ImportedSheet[] = [];
  for (const sheetName of book.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(book.Sheets[sheetName], {
      header: 1,
      raw: false,
      defval: "",
    }) as unknown[][];
    const parsed = parseGrid(rows, sheetName || fallbackName);
    if (parsed) found.push(parsed);
  }
  return found;
}
