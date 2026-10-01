export type PastRoster = {
  name: string;
  picks: readonly string[];
};

export type Standing = {
  place: number;
  name: string;
  scores: readonly number[];
  total: string;
  prize?: string;
};

export type CastScore = {
  name: string;
  pts: number;
};

export type PastSeason = {
  id: string;
  season: number;
  rosters: readonly PastRoster[];
  standings: readonly Standing[];
  cast: readonly CastScore[];
};

export const pastSeasons: readonly PastSeason[] = [
  {
    id: "s50",
    season: 50,
    rosters: [
      { name: "Eleanor", picks: ["Rizo", "Cirie", "Genevieve", "Savannah"] },
      { name: "Kirt", picks: ["Joe", "Aubry", "Genevieve", "Mike"] },
      { name: "Robin", picks: ["Jonathan", "Charlie", "Chrissy", "Mike"] },
      { name: "Cameron", picks: ["Cirie", "Charlie", "Genevieve", "Savannah"] },
      { name: "Jenna", picks: ["Rick", "Charlie", "Emily", "Savannah"] },
      { name: "Tanner", picks: ["Aubry", "Jonathan", "Stephanie", "Mike"] },
      { name: "Keegan", picks: ["Coach", "Emily", "Colby", "Tiffany"] },
      { name: "Kris", picks: ["Savannah", "Coach", "Rick", "Q"] },
      { name: "Ryan", picks: ["Joe", "Rizo", "Rick", "Tiffany"] },
      { name: "Luke", picks: ["Christian", "Genevieve", "Colby", "Tiffany"] },
      { name: "Rick", picks: ["Aubry", "Cirie", "Stephanie", "Chrissy"] },
      { name: "Lauren", picks: ["Christian", "Charlie", "Emily", "Tiffany"] },
      { name: "Jen", picks: ["Joe", "Ozzy", "Colby", "Kamilla"] },
      { name: "Josh", picks: ["Coach", "Rick", "Q", "Kamilla"] },
      { name: "Grandma", picks: ["Joe", "Jonathan", "Stephanie", "Angelina"] },
      { name: "Tivin", picks: ["Aubry", "Rizo", "Stephanie", "Dee"] },
      { name: "Madison", picks: ["Christian", "Angelina", "Chrissy", "Dee"] },
      { name: "Jared", picks: ["Christian", "Rizo", "Angelina", "Dee"] },
      { name: "Elise", picks: ["Colby", "Ozzy", "Q", "Kamilla"] },
      { name: "Erin", picks: ["Jonathan", "Emily", "Q", "Mike"] },
      { name: "Jonathan", picks: ["Cirie", "Ozzy", "Angelina", "Chrissy"] },
      { name: "Robbie", picks: ["Ozzy", "Coach", "Dee", "Kamilla"] },
    ],
    standings: [
      { place: 1, name: "Ryan", scores: [3, 4, 7, 5], total: "19", prize: "$300" },
      { place: 2, name: "Tivin", scores: [1, 4, 10, 14], total: "29+", prize: "$150" },
      { place: 3, name: "Rick", scores: [1, 6, 10, 12], total: "29−", prize: "$75" },
      { place: 4, name: "Tanner", scores: [1, 2, 10, 20], total: "33" },
      { place: 5, name: "Grandma", scores: [3, 2, 10, 19], total: "34" },
      { place: 6, name: "Kirt", scores: [3, 1, 16, 20], total: "40" },
      { place: 7, name: "Keegan", scores: [12, 9, 15, 5], total: "41" },
      { place: 8, name: "Jen", scores: [3, 8, 15, 17], total: "43+" },
      { place: 9, name: "Lauren", scores: [11, 18, 9, 5], total: "43−" },
      { place: 10, name: "Jonathan", scores: [6, 8, 19, 12], total: "45" },
      { place: 11, name: "Luke", scores: [11, 16, 15, 5], total: "47" },
      { place: 12, name: "Eleanor", scores: [4, 6, 16, 22], total: "48+" },
      { place: 13, name: "Jared", scores: [11, 4, 19, 14], total: "48−" },
      { place: 14, name: "Robbie", scores: [8, 12, 14, 17], total: "51" },
      { place: 15, name: "Erin", scores: [2, 9, 21, 20], total: "52+" },
      { place: 16, name: "Robin", scores: [2, 18, 12, 20], total: "52−" },
      { place: 17, name: "Jenna", scores: [7, 18, 9, 22], total: "56+" },
      { place: 18, name: "Madison", scores: [11, 19, 12, 14], total: "56−" },
      { place: 19, name: "Josh", scores: [12, 7, 21, 17], total: "57" },
      { place: 20, name: "Elise", scores: [15, 8, 21, 17], total: "61" },
      { place: 21, name: "Cameron", scores: [6, 18, 16, 22], total: "62+" },
      { place: 22, name: "Kris", scores: [22, 12, 7, 21], total: "62−", prize: "$25" },
    ],
    cast: [
      { name: "Tiffany", pts: 5 },
      { name: "Cirie", pts: 6 },
      { name: "Rick", pts: 7 },
      { name: "Ozzy", pts: 8 },
      { name: "Emily", pts: 9 },
      { name: "Stephanie", pts: 10 },
      { name: "Christian", pts: 11 },
      { name: "Chrissy", pts: 12 },
      { name: "Coach", pts: 12 },
      { name: "Dee", pts: 14 },
      { name: "Colby", pts: 15 },
      { name: "Genevieve", pts: 16 },
      { name: "Kamilla", pts: 17 },
      { name: "Charlie", pts: 18 },
      { name: "Angelina", pts: 19 },
      { name: "Mike", pts: 20 },
      { name: "Q", pts: 21 },
      { name: "Savannah", pts: 22 },
      { name: "Kyle", pts: 23 },
      { name: "Jenna", pts: 24 },
    ],
  },
  {
    id: "s49",
    season: 49,
    rosters: [
      { name: "Jonathan", picks: ["Sophi B", "Matt", "Nate", "Kristina"] },
      { name: "Shari", picks: ["MC", "Jawan", "Shannon", "Annie"] },
      { name: "Tivin", picks: ["Jason", "Alex", "Steven", "Kristina"] },
      { name: "Eleanor", picks: ["Sophi B", "Jawan", "Nate", "Annie"] },
      { name: "Ryan", picks: ["Nate", "Steven", "Shannon", "Kristina"] },
      { name: "Josh", picks: ["Matt", "Jawan", "Shannon", "Sage"] },
      { name: "Cameron", picks: ["MC", "Nate", "Matt", "Jeremiah"] },
      { name: "Jen", picks: ["Alex", "Jason", "Matt", "Sage"] },
      { name: "Kaleb", picks: ["Jason", "MC", "Sophie S", "Jeremiah"] },
      { name: "Rick", picks: ["Sophi B", "Jawan", "Shannon", "Kristina"] },
      { name: "Keegan", picks: ["Sophi B", "Matt", "Shannon", "Jeremiah"] },
      { name: "Avary", picks: ["Jake", "Jawan", "Sage", "Sophie S"] },
      { name: "Elise", picks: ["MC", "Alex", "Sage", "Sophie S"] },
      { name: "Grandma", picks: ["Jake", "Alex", "Jason", "Sage"] },
      { name: "Jared", picks: ["Sophi B", "MC", "Steven", "Sophie S"] },
      { name: "Emily", picks: ["Jake", "Alex", "Steven", "Sophie S"] },
      { name: "Tanner", picks: ["Nate", "Jake", "Steven", "Jeremiah"] },
      { name: "Erin", picks: ["Jake", "Jason", "Jeremiah", "Kristina"] },
    ],
    standings: [
      { place: 1, name: "Jared", scores: [2, 10, 6, 7], total: "25", prize: "$260" },
      { place: 2, name: "Rick", scores: [2, 8, 12, 5], total: "27", prize: "$125" },
      { place: 3, name: "Elise", scores: [10, 9, 3, 7], total: "29", prize: "$65" },
      { place: 4, name: "Jonathan", scores: [2, 14, 11, 5], total: "32" },
      { place: 5, name: "Tivin", scores: [13, 9, 6, 5], total: "33" },
      { place: 6, name: "Avary", scores: [16, 8, 3, 7], total: "34+" },
      { place: 7, name: "Ryan", scores: [11, 6, 12, 5], total: "34−" },
      { place: 8, name: "Josh", scores: [14, 8, 12, 3], total: "37" },
      { place: 9, name: "Eleanor", scores: [2, 8, 11, 17], total: "38+" },
      { place: 10, name: "Emily", scores: [16, 9, 6, 7], total: "38−" },
      { place: 11, name: "Jen", scores: [9, 13, 14, 3], total: "39" },
      { place: 12, name: "Grandma", scores: [16, 9, 13, 3], total: "41" },
      { place: 13, name: "Keegan", scores: [2, 14, 12, 15], total: "43" },
      { place: 14, name: "Kaleb", scores: [13, 10, 7, 15], total: "45" },
      { place: 15, name: "Shari", scores: [10, 8, 12, 17], total: "47" },
      { place: 16, name: "Tanner", scores: [11, 16, 6, 15], total: "48" },
      { place: 17, name: "Erin", scores: [16, 13, 15, 5], total: "49" },
      { place: 18, name: "Cameron", scores: [10, 11, 14, 15], total: "50" },
    ],
    cast: [
      { name: "Matt", pts: 14 },
      { name: "Annie", pts: 17 },
      { name: "Jake", pts: 16 },
      { name: "Jeremiah", pts: 15 },
      { name: "Nicole", pts: 18 },
    ],
  },
  {
    id: "s48",
    season: 48,
    rosters: [
      { name: "Eleanor", picks: ["Joe", "Kamilla", "Bianca", "Kevin"] },
      { name: "Elise", picks: ["Joe", "Kyle", "Mitch", "Star"] },
      { name: "Erin", picks: ["Eva", "Thomas", "Kyle", "Kevin"] },
      { name: "Grandma", picks: ["Joe", "Shauhin", "Chrissy", "Justin"] },
      { name: "Jared", picks: ["Joe", "Chrissy", "Mitch", "Justin"] },
      { name: "Jen", picks: ["Eva", "Kevin", "Mary", "David"] },
      { name: "Jonathan", picks: ["Kyle", "Shauhin", "Mary", "Cedrek"] },
      { name: "Josh", picks: ["David", "Mitch", "Mary", "Star"] },
      { name: "Kaleb", picks: ["Charity", "Chrissy", "David", "Cedrek"] },
      { name: "Keegan", picks: ["Eva", "Kyle", "Mitch", "Justin"] },
      { name: "Lauren", picks: ["Thomas", "Bianca", "Star", "Charity"] },
      { name: "Rick", picks: ["Thomas", "Star", "Kamilla", "Saiounia"] },
      { name: "Ryan", picks: ["Shauhin", "David", "Bianca", "Charity"] },
      { name: "Shari", picks: ["Eva", "Justin", "Kamilla", "Cedrek"] },
      { name: "Tanner", picks: ["Chrissy", "Thomas", "Kamilla", "Cedrek"] },
      { name: "Tivin", picks: ["Shauhin", "Mary", "Bianca", "Charity"] },
    ],
    standings: [
      { place: 1, name: "Elise", scores: [3, 1, 5, 8], total: "17", prize: "$230" },
      { place: 2, name: "Keegan", scores: [2, 1, 5, 16], total: "24", prize: "$110" },
      { place: 3, name: "Jonathan", scores: [1, 6, 7, 11], total: "25", prize: "$60" },
      { place: 4, name: "Josh", scores: [9, 5, 7, 8], total: "29" },
      { place: 5, name: "Shari", scores: [2, 16, 4, 11], total: "33" },
      { place: 6, name: "Jared", scores: [3, 10, 5, 16], total: "34" },
      { place: 7, name: "Erin", scores: [2, 15, 1, 17], total: "35+" },
      { place: 8, name: "Jen", scores: [2, 17, 7, 9], total: "35" },
      { place: 9, name: "Grandma", scores: [3, 6, 10, 16], total: "35−" },
      { place: 10, name: "Eleanor", scores: [3, 4, 14, 17], total: "38" },
      { place: 11, name: "Rick", scores: [15, 8, 4, 12], total: "39" },
      { place: 12, name: "Tanner", scores: [10, 15, 4, 11], total: "40+" },
      { place: 13, name: "Tivin", scores: [6, 7, 14, 13], total: "40−" },
      { place: 14, name: "Ryan", scores: [6, 9, 14, 13], total: "42" },
      { place: 15, name: "Kaleb", scores: [13, 10, 9, 11], total: "43" },
      { place: 16, name: "Lauren", scores: [15, 14, 8, 13], total: "50" },
    ],
    cast: [],
  },
  {
    id: "s47",
    season: 47,
    rosters: [
      { name: "Eleanor", picks: ["Caroline", "Tiyana", "Kishan", "Rome"] },
      { name: "Elise", picks: ["Kyle", "Teeny", "TK", "Rome"] },
      { name: "Erin", picks: ["Kishan", "Sam", "Sierra", "Rome"] },
      { name: "Grandma", picks: ["Sierra", "Sam", "Teeny", "Gabe"] },
      { name: "Jared", picks: ["Tiyana", "Sol", "Sue", "Andy"] },
      { name: "Jonathan", picks: ["Sierra", "Gabe", "Genevieve", "Aysha"] },
      { name: "Kaleb", picks: ["Kyle", "Caroline", "TK", "Anika"] },
      { name: "Keegan", picks: ["Tiyana", "Kyle", "Gabe", "Kishan"] },
      { name: "Lauren", picks: ["Teeny", "TK", "Genevieve", "Anika"] },
      { name: "Ryan", picks: ["Aysha", "Sam", "Rachel", "Genevieve"] },
      { name: "Tanner", picks: ["Sol", "Sue", "Caroline", "Rachel"] },
      { name: "Tivin", picks: ["Sol", "Rachel", "Aysha", "Sue"] },
    ],
    standings: [
      { place: 1, name: "Tanner", scores: [10, 3, 7, 1], total: "21", prize: "$180" },
      { place: 2, name: "Ryan", scores: [16, 2, 1, 5], total: "24", prize: "$80" },
      { place: 3, name: "Grandma", scores: [11, 2, 4, 9], total: "26", prize: "$40" },
      { place: 4, name: "Tivin", scores: [10, 1, 16, 3], total: "30" },
      { place: 5, name: "Jared", scores: [12, 10, 3, 6], total: "31" },
      { place: 6, name: "Lauren", scores: [4, 17, 5, 14], total: "40" },
      { place: 7, name: "Erin", scores: [15, 2, 11, 13], total: "41+" },
      { place: 8, name: "Jonathan", scores: [11, 9, 5, 16], total: "41−" },
      { place: 9, name: "Elise", scores: [8, 4, 17, 13], total: "42" },
      { place: 10, name: "Keegan", scores: [12, 8, 9, 15], total: "44" },
      { place: 11, name: "Kaleb", scores: [8, 7, 17, 14], total: "46" },
      { place: 12, name: "Eleanor", scores: [7, 12, 15, 13], total: "47" },
    ],
    cast: [],
  },
  {
    id: "s46",
    season: 46,
    rosters: [
      { name: "Eleanor", picks: ["Maria", "Q", "Tiffany", "Liz"] },
      { name: "Elise", picks: ["Soda", "Ben", "Venus", "Randen"] },
      { name: "Erin", picks: ["Kenzie", "Charlie", "Moriah", "Jess"] },
      { name: "Grandma", picks: ["Q", "Hunter", "Moriah", "Liz"] },
      { name: "Jared", picks: ["Venus", "Kenzie", "Soda", "Jem"] },
      { name: "Keegan", picks: ["Hunter", "Tevin", "Ben", "Tim"] },
      { name: "Lauren", picks: ["Tiffany", "Maria", "Jem", "Bhanu"] },
      { name: "Tanner", picks: ["Charlie", "Tevin", "Bhanu", "Tim"] },
    ],
    standings: [
      { place: 1, name: "Eleanor", scores: [5, 6, 8, 4], total: "23", prize: "$100" },
      { place: 2, name: "Grandma", scores: [6, 9, 13, 4], total: "32", prize: "$40" },
      { place: 3, name: "Erin", scores: [1, 2, 13, 17], total: "33+", prize: "$20" },
      { place: 4, name: "Jared", scores: [7, 1, 11, 14], total: "33−" },
      { place: 5, name: "Keegan", scores: [9, 10, 3, 12], total: "34" },
      { place: 6, name: "Elise", scores: [11, 3, 7, 16], total: "37" },
      { place: 7, name: "Tanner", scores: [2, 10, 15, 12], total: "39" },
      { place: 8, name: "Lauren", scores: [8, 5, 14, 15], total: "42" },
    ],
    cast: [],
  },
];

export function rosterFor(season: PastSeason, name: string): PastRoster | undefined {
  return season.rosters.find((r) => r.name === name);
}

export function standingFor(season: PastSeason, name: string): Standing | undefined {
  return season.standings.find((s) => s.name === name);
}
