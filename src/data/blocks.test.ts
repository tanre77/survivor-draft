import assert from "node:assert/strict";
import test from "node:test";
import { isBlocked } from "./blocks.ts";

test("a blocked name matches regardless of case", () => {
  assert.equal(isBlocked("Keegan", ["keegan"]), true);
  assert.equal(isBlocked("Elise", ["keegan"]), false);
  assert.equal(isBlocked("  ", ["keegan"]), false);
});
