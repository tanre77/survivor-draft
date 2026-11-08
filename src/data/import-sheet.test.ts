import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv, parseGrid } from "./import-sheet.ts";

const grid = [
  ["", "SURVIVOR 48 DRAFT"],
  [],
  ["Name", "Pick 1", "Pick 2", "Pick 3", "Pick 4", "", "#", "Name", "Points", "", "", "", "Total", "Prize"],
  ["Elise", "Joe", "Kyle", "Mitch", "Star", "", "1", "Elise", "3", "1", "5", "8", "17", "230"],
  ["Keegan", "Eva", "Kyle", "Mitch", "Justin", "", "2", "Keegan", "2", "1", "5", "16", "24", "110"],
  ["Erin", "Eva", "Thomas", "Kyle", "Kevin", "", "7", "Erin", "2", "15", "1", "17", "35+", ""],
];

test("a family-style sheet keeps picks, scores, and the plus tie", () => {
  const league = parseGrid(grid, "S48");
  assert.ok(league);
  assert.equal(league.name, "Season 48");
  assert.equal(league.scored, true);
  const elise = league.seats.find((seat) => seat.name === "Elise");
  assert.deepEqual(elise?.picks, ["Joe", "Kyle", "Mitch", "Star"]);
  assert.deepEqual(elise?.scores, [3, 1, 5, 8]);
  assert.equal(elise?.total, "17");
  assert.equal(elise?.prize, "$230");
  assert.equal(elise?.place, 1);
  const erin = league.seats.find((seat) => seat.name === "Erin");
  assert.equal(erin?.total, "35+");
  assert.equal(erin?.place, 7);
});

test("a pasted draft without scores stays a draft", () => {
  const league = parseCsv("Name,Pick 1,Pick 2,Pick 3\nTanner,Rob,Maggie,Kilby\nJen,Kilby,Kristin,Carter\n");
  assert.ok(league);
  assert.equal(league.scored, false);
  assert.equal(league.seats.length, 2);
  assert.deepEqual(league.seats[0].picks, ["Rob", "Maggie", "Kilby"]);
});
