import assert from "node:assert/strict";
import test from "node:test";
import { ordinal, standingPlace } from "./league.ts";

test("the lowest score is first and ties stay tied", () => {
  const totals = [0, 21, 0, 41, 0];
  assert.equal(standingPlace(0, totals), 1);
  assert.equal(standingPlace(21, totals), 4);
  assert.equal(standingPlace(41, totals), 5);
  assert.equal(ordinal(1), "1st");
  assert.equal(ordinal(2), "2nd");
  assert.equal(ordinal(3), "3rd");
  assert.equal(ordinal(11), "11th");
});
