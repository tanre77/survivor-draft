import assert from "node:assert/strict";
import test from "node:test";
import { episodeFinish, episodeFinishLine } from "./airtime.ts";

test("a Wednesday episode finishes at 9:30pm Eastern", () => {
  const during = Date.parse("2026-10-28T21:00:00-04:00");
  const finish = episodeFinish(during);
  assert.equal(finish.done, false);
  assert.equal(new Date(finish.at).toISOString(), "2026-10-29T01:30:00.000Z");
  const after = episodeFinish(Date.parse("2026-10-28T21:33:00-04:00"));
  assert.equal(after.done, true);
  assert.equal(after.at, finish.at);
  const tuesday = episodeFinish(Date.parse("2026-10-27T12:00:00-04:00"));
  assert.equal(tuesday.done, false);
  assert.equal(new Date(tuesday.at).toISOString(), "2026-10-29T01:30:00.000Z");
  assert.match(episodeFinishLine(after.at), /finished/);
});
