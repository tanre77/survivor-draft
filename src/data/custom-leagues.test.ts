import assert from "node:assert/strict";
import test from "node:test";
import { draftIsFull, leagueStillOpen, matchupWinner, nextDrafter, pairSeats, snakeSlot, takenBy } from "./custom-leagues.ts";

const seats = [
  { id: "a", name: "Elise", picks: ["Joe", "Kyle", "Mitch"] },
  { id: "b", name: "Keegan", picks: ["Kyle", "Eva"] },
];

test("a snake gives the last pick of a round the first pick of the next", () => {
  assert.equal(snakeSlot(0, 4), 0);
  assert.equal(snakeSlot(3, 4), 3);
  assert.equal(snakeSlot(4, 4), 3);
  assert.equal(snakeSlot(5, 4), 2);
  assert.equal(snakeSlot(7, 4), 0);
  assert.equal(snakeSlot(8, 4), 0);
});

test("head to head pairs the order and the lower score wins", () => {
  const pairs = pairSeats(["Elise", "Keegan", "Erin"]);
  assert.deepEqual(pairs, [["Elise", "Keegan"], ["Erin", null]]);
  assert.equal(matchupWinner(12, 18), "a");
  assert.equal(matchupWinner(20, 14), "b");
  assert.equal(matchupWinner(9, 9), "tie");
  assert.equal(matchupWinner(9, null), "open");
});

test("the draft stops after three picks each", () => {
  const table = [
    { id: "a", picks: ["a", "b", "c"] },
    { id: "b", picks: ["d", "e", "f"] },
  ];
  assert.equal(nextDrafter(table), null);
  assert.equal(draftIsFull(table), true);
  assert.equal(draftIsFull([{ picks: ["a"] }, { picks: [] }]), false);
  assert.equal(leagueStillOpen({ drafting: true, seats: [{ picks: [] }] }), true);
  assert.equal(leagueStillOpen({ drafting: false, seats: [{ picks: ["a", "b", "c"] }, { picks: ["d", "e", "f"] }] }), false);
  assert.equal(nextDrafter([{ id: "a", picks: ["a"] }, { id: "b", picks: [] }])?.id, "b");
});

test("the same players in a different order are the same team", () => {
  assert.equal(takenBy(seats, ["mitch", "joe", "Kyle"], ["b"]), "Elise");
  assert.equal(takenBy(seats, ["Kyle", "Eva", "Joe"], ["a"]), null);
  assert.equal(takenBy(seats, [], ["a"]), null);
});
