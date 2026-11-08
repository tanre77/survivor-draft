import { createServerFn } from "@tanstack/react-start";
import { draftIsFull, nextDrafter } from "@/data/custom-leagues";
import type { CustomSeat } from "@/data/custom-leagues";
import { inviteUrl } from "@/data/invite";
import { normalizeEmail } from "@/data/profile";
import { normalizeCode } from "@/lib/shared-leagues";

async function sql() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function requestOrigin(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const host = (req?.headers.get("x-forwarded-host") || req?.headers.get("host") || "").split(",")[0]?.trim();
    if (!host) return "";
    const proto = req?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

export const saveTurnAlert = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("That alert could not be saved.");
    const row = input as Record<string, unknown>;
    const code = normalizeCode(typeof row.code === "string" ? row.code : "");
    const name = typeof row.name === "string" ? row.name.trim().slice(0, 40) : "";
    const email = typeof row.email === "string" ? normalizeEmail(row.email) : "";
    if (code.length !== 6) throw new Error("This league has no invite yet.");
    if (!name) throw new Error("Save your name on the You tab.");
    if (!email) throw new Error("Add an email on the You tab.");
    return { code, name, email };
  })
  .handler(async ({ data }) => {
    const db = await sql();
    await db.query(
      `insert into turn_alerts (code, name, email)
       values ($1, $2, $3)
       on conflict (code, name) do update set email = excluded.email`,
      [data.code, data.name, data.email],
    );
    return { ok: true as const };
  });

export const notifyTurn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("That alert could not be sent.");
    const row = input as Record<string, unknown>;
    const code = normalizeCode(typeof row.code === "string" ? row.code : "");
    const league = typeof row.league === "string" ? row.league.trim().slice(0, 80) : "";
    const drafting = row.drafting !== false;
    const origin = typeof row.origin === "string" ? row.origin.trim().slice(0, 200) : "";
    const seats = Array.isArray(row.seats) ? (row.seats as CustomSeat[]) : [];
    if (code.length !== 6 || !league) throw new Error("That league could not be mailed.");
    return { code, league, drafting, origin, seats };
  })
  .handler(async ({ data }) => {
    if (!data.drafting || draftIsFull(data.seats)) return { sent: false as const };
    const clock = nextDrafter(data.seats);
    if (!clock) return { sent: false as const };
    const db = await sql();
    const rows = await db.query<{ email: string; last_key: string }>(
      `select email, last_key from turn_alerts where code = $1 and lower(name) = lower($2)`,
      [data.code, clock.name],
    );
    const alert = rows[0];
    if (!alert?.email) return { sent: false as const };
    const key = String(data.seats.reduce((sum, seat) => sum + seat.picks.length, 0));
    if (alert.last_key === key) return { sent: true as const };
    const origin = data.origin || (await requestOrigin());
    const link = origin ? inviteUrl(origin, data.code, clock.name) : "";
    const { callTool, ConnectorType } = await import("@/lib/app-data/client.server");
    const result = await callTool(
      "gmail_send_message",
      {
        to: [alert.email],
        subject: `Your turn in ${data.league}`,
        body: [
          `${clock.name}, you're on the clock in ${data.league}.`,
          link ? `Open your draft: ${link}` : "Open Survivor Fantasy Draft and take your pick.",
        ].join("\n\n"),
      },
      { connectorType: ConnectorType.Gmail },
    );
    if (!result.ok) return { sent: false as const, error: result.errorMessage ?? "Email didn't send." };
    await db.query(`update turn_alerts set last_key = $3 where code = $1 and lower(name) = lower($2)`, [
      data.code,
      clock.name,
      key,
    ]);
    return { sent: true as const };
  });
