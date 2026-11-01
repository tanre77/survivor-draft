import assert from "node:assert/strict";
import test from "node:test";
import { themeName } from "./theme.ts";

test("system follows the device and a choice wins", () => {
  assert.equal(themeName("system", true), "dark");
  assert.equal(themeName("system", false), "light");
  assert.equal(themeName("light", true), "light");
  assert.equal(themeName("dark", false), "dark");
});
