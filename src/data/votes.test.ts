import assert from "node:assert/strict";
import test from "node:test";
import { votingRecord } from "./league.ts";

const before = Date.parse("2026-10-01T05:59:00.000Z");
const after = Date.parse("2026-10-01T06:01:00.000Z");

test("a card only shows tribals that player was part of, after they air", () => {
  const early = votingRecord("aaliyah", before);
  assert.equal(early.length, 1);
  assert.equal(early[0]?.mine?.note, "shot");
  assert.deepEqual(early[0]?.against.sort(), ["brady", "kilby", "maggie", "mike", "patt", "thien-an"]);
  assert.equal(votingRecord("alexis", before).length, 0);

  const ana = votingRecord("ana", after);
  assert.equal(ana[0]?.mine?.for, "eric");
  assert.equal(ana[0]?.against.length, 6);
  assert.equal(votingRecord("lewis", after).some((row) => row.mine?.note === "exile"), true);
});
