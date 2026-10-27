import assert from "node:assert/strict";
import test from "node:test";
import { compareStandings, finishPoints, ordinal, standingPlace } from "./league.ts";

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

test("a tied total goes to the better finish, and both finalists score 2", () => {
  const better = compareStandings({ total: 40, picks: ["jenna", "rob", "ana"] }, { total: 40, picks: ["aaliyah", "patt", "rob"] });
  assert.equal(better < 0, true);
  assert.equal(compareStandings({ total: 10, picks: ["ana"] }, { total: 12, picks: ["ana"] }) < 0, true);
  assert.equal(finishPoints("3rd place · Finalist"), 2);
  assert.equal(finishPoints("2nd runner-up"), 2);
  assert.equal(finishPoints("19th place · Quit · Day 6"), 19);
});
