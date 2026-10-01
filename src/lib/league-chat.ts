import { createServerFn } from "@tanstack/react-start";
import { normalizeCode } from "@/lib/shared-leagues";

export type LeagueMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

type MessageRow = {
  id: string;
  author: string;
  body: string;
  created_at: string | Date;
};

function stamp(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function asMessage(row: MessageRow): LeagueMessage {
  return { id: row.id, author: row.author, body: row.body, createdAt: stamp(row.created_at) };
}

async function sql() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

export const listLeagueMessages = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const code = normalizeCode(typeof input === "string" ? input : "");
    if (code.length !== 6) throw new Error("That league has no chat.");
    return code;
  })
  .handler(async ({ data }): Promise<LeagueMessage[]> => {
    const db = await sql();
    const rows = await db.query<MessageRow>(
      `select id, author, body, created_at from league_messages where code = $1 order by created_at asc limit 80`,
      [data],
    );
    return rows.map(asMessage);
  });

export const postLeagueMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("That message could not be sent.");
    const row = input as Record<string, unknown>;
    const code = normalizeCode(typeof row.code === "string" ? row.code : "");
    const author = typeof row.author === "string" ? row.author.trim().slice(0, 40) : "";
    const body = typeof row.body === "string" ? row.body.trim().slice(0, 280) : "";
    if (code.length !== 6) throw new Error("Make an invite code before the league can talk.");
    if (!author) throw new Error("Save your name on the You tab first.");
    if (!body) throw new Error("Write something first.");
    return { code, author, body };
  })
  .handler(async ({ data }): Promise<LeagueMessage> => {
    const db = await sql();
    const league = await db.query<{ code: string }>(`select code from shared_leagues where code = $1`, [data.code]);
    if (!league[0]) throw new Error("Make an invite code before the league can talk.");
    const rows = await db.query<MessageRow>(
      `insert into league_messages (id, code, author, body) values ($1, $2, $3, $4)
       returning id, author, body, created_at`,
      [crypto.randomUUID(), data.code, data.author, data.body],
    );
    await db.query(
      `delete from league_messages where code = $1 and id not in (
         select id from league_messages where code = $1 order by created_at desc limit 80
       )`,
      [data.code],
    );
    if (!rows[0]) throw new Error("That message could not be sent.");
    return asMessage(rows[0]);
  });
