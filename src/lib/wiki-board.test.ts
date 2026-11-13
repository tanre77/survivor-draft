import assert from "node:assert/strict";
import test from "node:test";
import { parseWikiBoots, revealAtFor } from "./wiki-board.ts";

const roster = [
  { id: "alexis", first: "Alexis", last: "Levine" },
  { id: "linnea", first: "Linnea", last: "Capobianco" },
  { id: "rob", first: "Rob", last: "Antonson" },
  { id: "brady", first: "Brady", last: "Booker" },
];

const wikitext = `
[[File:S51 alexis t.png|link=Alexis Levine]]
'''[[Alexis Levine]]'''<br />34, Atlanta
| 5th Voted Out<br />Day 10
|-
'''[[Linnea Capobianco]]'''<br />25, Jersey City
| 6th Voted Out<br />Day 10
|-
'''[[Rob Antonson]]'''
| Quit<br />Day 6
|-
'''[[Brady Booker]]'''
| Savu
`;

test("parseWikiBoots reads voted out, quit, and skips people still in", () => {
  const boots = parseWikiBoots(wikitext, roster, Date.parse("2026-10-24T19:00:00.000Z"));
  assert.deepEqual(
    boots.map((boot) => `${boot.id}:${boot.boot}`),
    ["alexis:5th voted out · Day 10", "linnea:6th voted out · Day 10", "rob:Quit · Day 6"],
  );
});

test("a jury line between voted out and the day still counts", () => {
  const wikitext = `{{nowrap|8th Voted Out<br />1st Jury Member<br />Day 14}}
'''[[Brady Booker]]'''<br />27, Knoxville
| {{nowrap|8th Voted Out<br />1st Jury Member<br />Day 14}}
|-
'''[[Carter Krull]]'''
| Savu
`;
  const boots = parseWikiBoots(wikitext, [{ id: "brady", first: "Brady", last: "Booker" }], Date.parse("2026-11-08T18:00:00.000Z"));
  assert.deepEqual(
    boots.map((boot) => boot.boot),
    ["8th voted out · Day 14"],
  );
});

test("a Wednesday night boot stays hidden until 9:30pm Eastern", () => {
  const during = Date.parse("2026-10-22T01:00:00.000Z");
  assert.equal(revealAtFor(during), "2026-10-22T01:30:00.000Z");
  const atEight = Date.parse("2026-10-22T00:00:00.000Z");
  assert.equal(revealAtFor(atEight), "2026-10-22T01:30:00.000Z");
  const beforeShow = Date.parse("2026-10-21T23:59:00.000Z");
  assert.ok(Date.parse(revealAtFor(beforeShow)) < beforeShow);
  const morningAfter = Date.parse("2026-10-22T17:00:00.000Z");
  assert.ok(Date.parse(revealAtFor(morningAfter)) < morningAfter);
});
