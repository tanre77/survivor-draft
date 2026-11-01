#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. Each file is applied in one transaction and
 * recorded in a `_migrations` table, so it runs once and is safe to re-run.
 *
 * The read is non-recursive, so the opt-in auth schema under migrations/auth/
 * is not applied to an app that never asked for sign-in.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { pendingMigrations } from "./migration-plan.mjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log(
    "[migrate] DATABASE_URL not set — skipping (the PGLite fallback migrates itself).",
  );
  process.exit(0);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

/** Neon URLs often include channel_binding, which node-postgres rejects. */
function connectionString(raw) {
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return raw.replace(/([?&])channel_binding=[^&]*/g, "$1").replace(/[?&]$/, "");
  }
}

function poolConfig(raw) {
  const connection = connectionString(raw);
  let remote = true;
  try {
    const host = new URL(connection).hostname;
    remote = host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
  } catch {
    remote = true;
  }
  return {
    connectionString: connection,
    max: 1,
    connectionTimeoutMillis: 10000,
    ssl: remote ? { rejectUnauthorized: false } : undefined,
  };
}

function retryable(err) {
  const code = err?.code;
  if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "EAI_AGAIN", "ECONNRESET", "57P01", "53300"].includes(code)) {
    return true;
  }
  return /timeout|ECONNRESET|the database system is starting|channel_binding|self-signed|certificate/i.test(
    String(err?.message || ""),
  );
}

async function connect() {
  let last;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const pool = new pg.Pool(poolConfig(databaseUrl));
    try {
      const client = await pool.connect();
      return { pool, client };
    } catch (err) {
      last = err;
      await pool.end().catch(() => undefined);
      if (!retryable(err) || attempt === 6) throw err;
      console.error(`[migrate] database not ready, retry ${attempt}/6`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw last;
}

async function main() {
  let entries;
  try {
    entries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }
  if (pendingMigrations(entries, []).length === 0) {
    console.log("[migrate] no migrations — nothing to do.");
    return;
  }

  const { pool, client } = await connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(entries, applied)) {
      const text = await readFile(join(migrationsDir, name), "utf8");
      try {
        await client.query("BEGIN");
        // pg's simple-query protocol runs a whole multi-statement file at once.
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  // A database that is not reachable yet must not fail the site build.
  // The server applies the same files on the first query.
  if (retryable(err)) {
    console.error("[migrate] continuing without a connection; schema will apply on first use.");
    process.exit(0);
  }
  process.exit(1);
});
