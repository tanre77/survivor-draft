import assert from "node:assert/strict";
import { test } from "node:test";
import { buildTable } from "./stats.ts";

test("pick 1 is cheaper than pick 4 across the finished sheets", () => {
  const table = buildTable();
  const first = table.slots.find((slot) => slot.slot === 1);
  const last = table.slots.find((slot) => slot.slot === 4);
  assert.ok(first && last);
  assert.ok(first.average < last.average);
  assert.equal(first.timesBest, 31);
  assert.equal(table.rosters, 76);
});

test("five winners and Ryan banked the most", () => {
  const table = buildTable();
  const winners = table.careers.filter((career) => career.wins > 0);
  assert.deepEqual(
    winners.map((career) => career.name).sort(),
    ["Eleanor", "Elise", "Jared", "Ryan", "Tanner"],
  );
  const richest = [...table.careers].sort((a, b) => b.money - a.money)[0];
  assert.equal(richest.name, "Ryan");
  assert.equal(richest.money, 380);
});
