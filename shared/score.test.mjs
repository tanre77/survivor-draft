import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { finishPoints, idolCount, isBootPublic, scoreOf, teamScore, winCount } from "./score.mjs";

const board = JSON.parse(readFileSync(new URL("./board.json", import.meta.url), "utf8"));
const byId = new Map(board.contestants.map((c) => [c.id, c]));
const before = Date.parse("2026-09-30T22:00:00.000Z");
const after = Date.parse("2026-10-01T06:00:01.000Z");

test("Aaliyah is already public and Ana stays hidden until 11pm Pacific", () => {
  assert.equal(isBootPublic(byId.get("aaliyah"), before), true);
  assert.equal(isBootPublic(byId.get("ana"), before), false);
  assert.equal(isBootPublic(byId.get("ana"), after), true);
  assert.equal(scoreOf(byId.get("ana"), board.bonuses, before, false, board.contestants.length), null);
  assert.equal(scoreOf(byId.get("ana"), board.bonuses, after, false, board.contestants.length), 20);
});

test("standard scoring ignores the jury line and advanced scoring does not", () => {
  const cast = board.contestants.length;
  assert.equal(finishPoints("1st voted out · Day 3", cast, false), cast);
  assert.equal(finishPoints("1st voted out · Day 3", cast, true), 27);
  assert.equal(finishPoints("2nd voted out · Day 5", cast, true), 25);
  assert.equal(finishPoints("6th voted out", cast, false), cast - 5);
  assert.equal(finishPoints("6th voted out", cast, true), 17);
  assert.equal(finishPoints("7th voted out", cast, false), cast - 6);
  assert.equal(finishPoints("7th voted out", cast, true), 15);
  assert.equal(finishPoints("Sole Survivor", cast, true), 1);
  assert.equal(finishPoints("Medevac · Day 4", cast, true), 0);
  assert.equal(finishPoints("19th place · Quit · Day 6", cast, false), 19);
  assert.equal(scoreOf(byId.get("aaliyah"), board.bonuses, before, false, cast), cast);
  assert.equal(scoreOf(byId.get("aaliyah"), board.bonuses, before, false, cast, true), 27);
});

test("Toka wins stay off the score until the same instant", () => {
  assert.equal(winCount(byId.get("brady"), board.bonuses, before), 0);
  assert.equal(winCount(byId.get("brady"), board.bonuses, after), 2);
  assert.equal(winCount(byId.get("rob"), board.bonuses, before), 1);
  assert.equal(idolCount(byId.get("rob"), board.bonuses, before), 1);
});

test("bonus points subtract only when the league opted in", () => {
  const rob = byId.get("rob");
  assert.equal(scoreOf({ ...rob, status: "out", boot: "10th voted out" }, board.bonuses, after, false, board.contestants.length), 12);
  assert.equal(scoreOf({ ...rob, status: "out", boot: "10th voted out" }, board.bonuses, after, true, board.contestants.length), 10);
});

test("a team with an unrevealed boot does not count that pick yet", () => {
  const early = teamScore(["rob", "maggie", "ana"], board.contestants, board.bonuses, before, true);
  assert.deepEqual(early, { total: 0, pending: 3 });
  const late = teamScore(["aaliyah"], board.contestants, board.bonuses, before, false);
  assert.deepEqual(late, { total: board.contestants.length, pending: 0 });
});

test("board has the full draft", () => {
  assert.equal(board.contestants.length, 21);
  assert.equal(board.managers.length, 23);
  assert.equal(board.pastSeasons.length, 5);
  for (const manager of board.managers) assert.equal(manager.picks.length, 3);
});
