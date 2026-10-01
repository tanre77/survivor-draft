import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("tsx/cjs");
const league = require("../src/data/league.ts");
const history = require("../src/data/history.ts");

const board = {
  contestants: league.contestants,
  managers: league.managers,
  bonuses: league.bonuses,
  pastSeasons: history.pastSeasons,
};

writeFileSync(new URL("./board.json", import.meta.url), JSON.stringify(board));
console.log(
  `board.json ${board.contestants.length} contestants, ${board.managers.length} managers, ${board.pastSeasons.length} seasons`,
);
