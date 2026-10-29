import assert from "node:assert/strict";
import test from "node:test";
import { latestBoots, pickPoints, type Contestant } from "./league.ts";

test("the latest night is the card, not the highest finish place", () => {
  const now = Date.parse("2026-10-28T14:00:00.000Z");
  const latest = latestBoots(undefined, now);
  assert.deepEqual(latest.map((player) => player.id), ["alexis", "linnea"]);
  assert.equal(pickPoints(latest[0], now), 17);
  assert.equal(pickPoints(latest[1], now), 16);
});

test("Ori is the card after episode 6 ends", () => {
  const now = Date.parse("2026-10-29T02:00:00.000Z");
  const latest = latestBoots(undefined, now);
  assert.deepEqual(latest.map((player) => player.id), ["ori"]);
  assert.equal(pickPoints(latest[0], now), 15);
});

test("a boot stays off the card until its reveal", () => {
  const before = Date.parse("2026-10-22T05:59:00.000Z");
  const latest = latestBoots(undefined, before);
  assert.deepEqual(latest.map((player) => player.first), ["Jenna"]);
});

test("a quit on an earlier day does not replace a later vote", () => {
  const rob = {
    id: "rob",
    first: "Rob",
    last: "Antonson",
    age: 40,
    hometown: "",
    job: "",
    tribe: "savu",
    status: "out",
    boot: "19th place · Quit · Day 6",
  } satisfies Contestant;
  const only = latestBoots([rob], Date.parse("2026-10-28T14:00:00.000Z"));
  assert.deepEqual(only.map((player) => player.id), ["rob"]);
});
