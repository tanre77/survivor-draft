import assert from "node:assert/strict";
import test from "node:test";
import { inviteUrl } from "./invite.ts";

test("an invite link carries the code and the new member", () => {
  assert.equal(
    inviteUrl("https://draft.example", "ab12cd", "Erin"),
    "https://draft.example/?join=AB12CD&name=Erin",
  );
  assert.equal(inviteUrl("https://draft.example/", "ab12cd"), "https://draft.example/?join=AB12CD");
});
