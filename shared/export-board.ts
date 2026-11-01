import { writeFileSync } from "node:fs";
import { bonuses, contestants, managers } from "../src/data/league.ts";
import { pastSeasons } from "../src/data/history.ts";

const board = { contestants, managers, bonuses, pastSeasons };
writeFileSync(new URL("./board.json", import.meta.url), JSON.stringify(board));
console.log(`board.json ${contestants.length} contestants, ${managers.length} managers, ${pastSeasons.length} seasons`);
