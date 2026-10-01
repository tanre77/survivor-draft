import { createServerFn } from "@tanstack/react-start";
import { normalizeCode } from "@/lib/shared-leagues";

const REASONS = ["Harassment", "Hate", "Spam", "Other"] as const;

async function sql() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

export const reportLeagueMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("That report could not be sent.");
    const row = input as Record<string, unknown>;
    const code = normalizeCode(typeof row.code === "string" ? row.code : "");
    const author = typeof row.author === "string" ? row.author.trim().slice(0, 40) : "";
    const reporter = typeof row.reporter === "string" ? row.reporter.trim().slice(0, 40) : "";
    const reason = typeof row.reason === "string" ? row.reason.trim() : "";
    const excerpt = typeof row.excerpt === "string" ? row.excerpt.trim().slice(0, 280) : "";
    const messageId = typeof row.messageId === "string" ? row.messageId.trim().slice(0, 80) : "";
    if (code.length !== 6) throw new Error("That league has no chat.");
    if (!author || !reporter) throw new Error("Save your name on the You tab first.");
    if (!REASONS.includes(reason as (typeof REASONS)[number])) throw new Error("Pick a reason.");
    return { code, author, reporter, reason, excerpt, messageId };
  })
  .handler(async ({ data }) => {
    const db = await sql();
    await db.query(
      `insert into league_reports (id, code, message_id, author, reporter, reason, excerpt)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), data.code, data.messageId || null, data.author, data.reporter, data.reason, data.excerpt],
    );
    return { ok: true as const };
  });

export const sendSupportRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("That note could not be sent.");
    const row = input as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim().slice(0, 40) : "";
    const body = typeof row.body === "string" ? row.body.trim().slice(0, 1000) : "";
    if (!name) throw new Error("Save your name on the You tab first.");
    if (body.length < 4) throw new Error("Write a little more.");
    return { name, body };
  })
  .handler(async ({ data }) => {
    const db = await sql();
    await db.query(`insert into support_requests (id, name, body) values ($1, $2, $3)`, [
      crypto.randomUUID(),
      data.name,
      data.body,
    ]);
    return { ok: true as const };
  });
