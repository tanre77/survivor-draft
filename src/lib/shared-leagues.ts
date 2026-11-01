import { createServerFn } from "@tanstack/react-start";
import type { CustomSeat } from "@/data/custom-leagues";
import { cleanReach } from "@/data/custom-leagues";

export type SharedLeague = {
  code: string;
  name: string;
  bonus: boolean;
  trades: boolean;
  drafting: boolean;
  advanced: boolean;
  headToHead: boolean;
  seats: CustomSeat[];
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function makeCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

function cleanSeats(value: unknown): CustomSeat[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 40).flatMap((seat) => {
    if (!seat || typeof seat !== "object") return [];
    const row = seat as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim().slice(0, 40) : "";
    if (!name) return [];
    const picks = Array.isArray(row.picks)
      ? row.picks.filter((pick): pick is string => typeof pick === "string" && pick.trim() !== "").map((pick) => pick.trim().slice(0, 40)).slice(0, 12)
      : [];
    const scores = Array.isArray(row.scores) ? row.scores.filter((score): score is number => typeof score === "number" && Number.isFinite(score)).slice(0, 12) : [];
    return [{
      id: typeof row.id === "string" && row.id.trim() ? row.id.trim().slice(0, 80) : crypto.randomUUID(),
      name,
      picks,
      ...(scores.length ? { scores } : {}),
      ...(typeof row.total === "string" ? { total: row.total.slice(0, 20) } : {}),
      ...(typeof row.prize === "string" ? { prize: row.prize.slice(0, 20) } : {}),
      ...(typeof row.place === "number" && Number.isFinite(row.place) ? { place: row.place } : {}),
      ...(cleanReach(row.reach) ? { reach: cleanReach(row.reach) } : {}),
    }];
  });
}

function payload(input: unknown): Omit<SharedLeague, "code"> {
  if (!input || typeof input !== "object") throw new Error("That league could not be saved.");
  const row = input as Record<string, unknown>;
  const name = typeof row.name === "string" ? row.name.trim().slice(0, 80) : "";
  if (!name) throw new Error("Name the league.");
  const seats = cleanSeats(row.seats);
  if (seats.length === 0) throw new Error("Add at least one person.");
  return {
    name,
    bonus: row.bonus === true,
    trades: row.trades === true,
    drafting: row.drafting !== false,
    advanced: row.advanced === true,
    headToHead: row.headToHead === true,
    seats,
  };
}

function coded(input: unknown): SharedLeague {
  if (!input || typeof input !== "object") throw new Error("That league could not be saved.");
  const code = normalizeCode(String((input as { code?: unknown }).code ?? ""));
  if (code.length !== 6) throw new Error("Enter the 6-character code.");
  return { code, ...payload(input) };
}

type LeagueRow = {
  code: string;
  name: string;
  bonus: boolean;
  trades: boolean;
  drafting: boolean;
  advanced: boolean;
  head_to_head: boolean;
  seats: unknown;
};

function fromRow(row: LeagueRow): SharedLeague {
  return {
    code: row.code,
    name: row.name,
    bonus: row.bonus === true,
    trades: row.trades === true,
    drafting: row.drafting !== false,
    advanced: row.advanced === true,
    headToHead: row.head_to_head === true,
    seats: cleanSeats(typeof row.seats === "string" ? JSON.parse(row.seats) : row.seats),
  };
}

async function sql() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

export const publishSharedLeague = createServerFn({ method: "POST" })
  .validator((input: unknown) => payload(input))
  .handler(async ({ data }): Promise<SharedLeague> => {
    const db = await sql();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = makeCode();
      const rows = await db.query<LeagueRow>(
        `insert into shared_leagues (code, name, bonus, trades, drafting, advanced, head_to_head, seats)
         values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
         on conflict (code) do nothing
         returning code, name, bonus, trades, drafting, advanced, head_to_head, seats`,
        [code, data.name, data.bonus, data.trades, data.drafting, data.advanced, data.headToHead, JSON.stringify(data.seats)],
      );
      if (rows[0]) return fromRow(rows[0]);
    }
    throw new Error("Could not make an invite code. Try again.");
  });

export const fetchSharedLeague = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const code = normalizeCode(typeof input === "string" ? input : String((input as { code?: unknown })?.code ?? ""));
    if (code.length !== 6) throw new Error("Enter the 6-character code.");
    return code;
  })
  .handler(async ({ data }): Promise<SharedLeague | null> => {
    const db = await sql();
    const rows = await db.query<LeagueRow>(
      `select code, name, bonus, trades, drafting, advanced, head_to_head, seats from shared_leagues where code = $1`,
      [data],
    );
    return rows[0] ? fromRow(rows[0]) : null;
  });

export const saveSharedLeague = createServerFn({ method: "POST" })
  .validator((input: unknown) => coded(input))
  .handler(async ({ data }): Promise<SharedLeague> => {
    const db = await sql();
    const rows = await db.query<LeagueRow>(
      `update shared_leagues
       set name = $2, bonus = $3, trades = $4, drafting = $5, advanced = $6, head_to_head = $7, seats = $8::jsonb, updated_at = now()
       where code = $1
       returning code, name, bonus, trades, drafting, advanced, head_to_head, seats`,
      [data.code, data.name, data.bonus, data.trades, data.drafting, data.advanced, data.headToHead, JSON.stringify(data.seats)],
    );
    if (!rows[0]) throw new Error("That code doesn't match a league.");
    return fromRow(rows[0]);
  });

export const deleteSharedLeague = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const code = normalizeCode(typeof input === "string" ? input : String((input as { code?: unknown })?.code ?? ""));
    if (code.length !== 6) throw new Error("Enter the 6-character code.");
    return code;
  })
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const db = await sql();
    await db.query(`delete from shared_leagues where code = $1`, [data]);
    return { ok: true };
  });
