import assert from "node:assert/strict";
import test from "node:test";
import type { CustomLeague } from "./custom-leagues.ts";
import { profileLines } from "./profile-lines.ts";
import { normalizeEmail } from "./profile.ts";

test("a profile collects past seasons and a custom league under one name", () => {
  const leagues: CustomLeague[] = [
    {
      id: "friends",
      name: "Office draft",
      bonus: false,
      trades: false,
      drafting: false,
      advanced: false,
      headToHead: false,
      code: "ABCD23",
      seats: [{ id: "t", name: "Tanner", picks: ["Kyle", "Joe"], scores: [1, 3], total: "4", place: 1, prize: "$20" }],
    },
  ];
  const lines = profileLines("tanner", leagues, Date.parse("2026-10-01T15:00:00.000Z"));
  assert.equal(lines.some((line) => line.where === "Office draft" && line.place === 1 && line.total === "4"), true);
  assert.equal(lines.some((line) => line.where === "Season 47" && line.place === 1), true);
  assert.equal(lines.some((line) => line.where === "Survivor 51"), true);
});

test("profile email keeps a real address and drops junk", () => {
  assert.equal(normalizeEmail(" Erin@Example.com "), "erin@example.com");
  assert.equal(normalizeEmail("not an email"), "");
});
