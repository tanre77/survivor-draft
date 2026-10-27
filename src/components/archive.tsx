import { useState } from "react";
import { PRE_JURY_BOOTS, contestants, managers, pointsForPlace } from "@/data/league";
import { pastSeasons, rosterFor, standingFor, type PastSeason, type Standing } from "@/data/history";

const CAST = contestants.length;
const STANDARD_EARLY = [
  ["1st boot", String(CAST)],
  ["2nd", String(CAST - 1)],
  ["3rd", String(CAST - 2)],
  ["4th", String(CAST - 3)],
  ["5th", String(CAST - 4)],
  ["6th", String(CAST - 5)],
];
const STANDARD_LATE = [
  ["4th place", "4"],
  ["3rd place", "3"],
  ["Both finalists", "2"],
  ["Sole survivor", "1"],
];

function bootPoints(boot: number, advanced: boolean): string {
  const place = CAST - boot + 1;
  return String(pointsForPlace(place, CAST, advanced));
}

const ADVANCED_PRE = Array.from({ length: PRE_JURY_BOOTS }, (_, index) => {
  const boot = index + 1;
  return [`${boot === 1 ? "1st" : boot === 2 ? "2nd" : boot === 3 ? "3rd" : `${boot}th`} boot`, bootPoints(boot, true)];
});
const ADVANCED_JURY = [
  ["7th boot", bootPoints(7, true)],
  ["8th", bootPoints(8, true)],
  ["3rd place", "3"],
  ["Runner-up", "2"],
  ["Sole survivor", "1"],
];

export function FinishedSeasons({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">ON THE SHEET</p>
      <h1 className="mt-1 font-display text-5xl leading-none">Past seasons</h1>
      <ul className="mt-4 flex flex-col gap-2">
        {pastSeasons.map((season) => {
          const winner = season.standings[0];
          return (
            <li key={season.id}>
              <button type="button" onClick={() => onOpen(season.id)} className="w-full rounded-2xl bg-surface px-4 py-3 text-left">
                <span className="block text-xs font-semibold tracking-widest text-muted">FINISHED</span>
                <span className="block font-display text-3xl leading-none">Season {season.season}</span>
                <span className="mt-1 block text-sm text-muted">
                  {winner.name} won · {winner.total}
                  {winner.prize ? ` · ${winner.prize}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function RulesBoard() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold tracking-widest text-muted">FROM THE SHEET</p>
        <h2 className="mt-1 font-display text-5xl leading-none">Lowest score wins</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Survivor 51 is $25 a person, settled outside this app. Venmo @Erin-8 or Zelle Tanner at 740-644-6229. The app does not take payment. The pot is $575. First pays $310, second $160, third $80, and last place gets $25 back.
        </p>
      </div>

      <section className="rounded-2xl bg-surface p-4">
        <h3 className="font-display text-3xl leading-none">Standard</h3>
        <p className="mt-1 text-sm text-muted">
          Your score is the finish place. 20th place is 20. The winner is 1. Lowest total wins. A tie goes to the better finish, then the next pick. Both losing finalists score 2, not 2 and 3. Each person drafts 3 names. A contestant can be taken 4 times, and no two teams can match.
        </p>
        <ScoreGrid rows={STANDARD_EARLY} emphasizeFirst />
        <ScoreGrid rows={STANDARD_LATE} emphasizeLast />
      </section>

      <section className="rounded-2xl bg-surface p-4">
        <h3 className="font-display text-3xl leading-none">Advanced</h3>
        <p className="mt-1 text-sm text-muted">
          The first {PRE_JURY_BOOTS} boots are pre-jury and cost 2 points apart. From the 7th boot on, that is the jury, and each finish is 1 point apart. The winner is still 1. A new league can turn this on.
        </p>
        <p className="mt-3 text-xs font-semibold tracking-widest text-muted">PRE-JURY</p>
        <ScoreGrid rows={ADVANCED_PRE} emphasizeFirst />
        <p className="mt-3 text-xs font-semibold tracking-widest text-muted">JURY</p>
        <ScoreGrid rows={ADVANCED_JURY} emphasizeLast />
      </section>

      <section className="rounded-2xl bg-surface p-4">
        <h3 className="font-display text-3xl leading-none">What scores zero</h3>
        <ul className="mt-3 flex flex-col gap-3 text-sm">
          <li>
            <p className="font-semibold">Idols and advantages</p>
            <p className="text-muted">Zero on the sheet, unless played at final-four fire or final tribal.</p>
          </li>
          <li>
            <p className="font-semibold">Quits and medevacs</p>
            <p className="text-muted">They score their finish place. A quit in 19th is 19. One with no place is 0.</p>
          </li>
          <li>
            <p className="font-semibold">Edge of Extinction</p>
            <p className="text-muted">A pre-merge boot who returns is worth 0 for that boot, then scores wherever they finish.</p>
          </li>
          <li>
            <p className="font-semibold">Final tribal votes</p>
            <p className="text-muted">The votes themselves are worth nothing.</p>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-line p-4">
        <p className="text-xs font-semibold tracking-widest text-toka">WORKED EXAMPLE</p>
        <p className="mt-2 text-sm">
          Standard: a first boot is worth {CAST}. Advanced: a first boot is worth {bootPoints(1, true)} because those six are pre-jury. Either way the winner is 1, and the lowest total wins.
        </p>
      </section>
    </div>
  );
}

function ScoreGrid({ rows, emphasizeLast, emphasizeFirst }: { rows: string[][]; emphasizeLast?: boolean; emphasizeFirst?: boolean }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-2">
      {rows.map(([place, pts], index) => {
        const mark = (emphasizeLast && index === rows.length - 1) || (emphasizeFirst && index === 0);
        return (
          <li
            key={place}
            className={`flex items-center justify-between rounded-xl px-3 py-2 ${mark ? "bg-toka text-toka-ink" : "bg-surface-2"}`}
          >
            <span className={`text-sm ${mark ? "font-semibold" : "text-muted"}`}>{place}</span>
            <span className="font-display text-2xl leading-none tabular-nums">{pts}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function HistoryBoard({
  seatName,
  onOpenTeam,
}: {
  seatName: string;
  onOpenTeam: (seasonId: string, name: string) => void;
}) {
  const [seasonId, setSeasonId] = useState(pastSeasons[0].id);
  const season = pastSeasons.find((s) => s.id === seasonId) ?? pastSeasons[0];
  const mine = season.standings.find((s) => s.name === seatName);

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">SEASONS 46–50</p>
      <h2 className="mt-1 font-display text-5xl leading-none">Past leagues</h2>
      <p className="mt-2 text-sm text-muted">Tap a name to open that team. A plus or minus is how the sheet broke a tie.</p>

      <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {pastSeasons.map((s) => {
          const row = s.standings.find((st) => st.name === seatName);
          if (!row) return null;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpenTeam(s.id, seatName)}
                className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 text-left"
              >
                <span>
                  <span className="block text-xs font-semibold tracking-widest text-muted">SEASON {s.season}</span>
                  <span className="font-display text-3xl leading-none">{placeLabel(row.place)}</span>
                </span>
                <span className="text-right">
                  <span className="block font-display text-3xl leading-none tabular-nums">{row.total}</span>
                  <span className="text-xs text-muted">{row.prize ?? "no prize"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {pastSeasons.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSeasonId(s.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${
              s.id === season.id ? "bg-fg text-bg" : "bg-surface-2 text-fg"
            }`}
          >
            Season {s.season}
          </button>
        ))}
      </div>

      <SeasonDetail season={season} mine={mine} seatName={seatName} onOpenTeam={(name) => onOpenTeam(season.id, name)} />
    </div>
  );
}

export function SeasonPage({
  seasonId,
  seatName,
  onOpenTeam,
}: {
  seasonId: string;
  seatName: string;
  onOpenTeam: (name: string) => void;
}) {
  const season = pastSeasons.find((s) => s.id === seasonId);
  if (!season) return null;
  const mine = season.standings.find((s) => s.name === seatName);
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">FINISHED</p>
      <h1 className="mt-1 font-display text-5xl leading-none">Season {season.season}</h1>
      <SeasonDetail season={season} mine={mine} seatName={seatName} onOpenTeam={onOpenTeam} />
    </div>
  );
}

export function PastTeam({ seasonId, name }: { seasonId: string; name: string }) {
  const season = pastSeasons.find((s) => s.id === seasonId);
  if (!season) return null;
  const standing = standingFor(season, name);
  const roster = rosterFor(season, name);
  if (!standing || !roster) return null;
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">
        SEASON {season.season} · {placeLabel(standing.place)}
      </p>
      <h1 className="mt-1 font-display text-5xl leading-none">{name}</h1>
      <p className="mt-2 text-sm text-muted">
        {standing.total} points{standing.prize ? ` · ${standing.prize}` : ""}
      </p>
      <ol className="mt-4 flex flex-col gap-2">
        {roster.picks.map((pick, index) => (
          <li key={`${name}-${pick}`} className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
            <span>
              <span className="block text-xs font-semibold tracking-widest text-muted">PICK {index + 1}</span>
              <span className="text-base font-semibold">{pick}</span>
            </span>
            <span className="font-display text-4xl leading-none tabular-nums text-toka">{standing.scores[index]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SeasonDetail({
  season,
  mine,
  seatName,
  onOpenTeam,
}: {
  season: PastSeason;
  mine?: Standing;
  seatName: string;
  onOpenTeam: (name: string) => void;
}) {
  const winner = season.standings[0];
  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-surface px-4 py-4">
        <p className="text-xs font-semibold tracking-widest text-toka">SEASON {season.season} WINNER</p>
        <button type="button" onClick={() => onOpenTeam(winner.name)} className="font-display text-4xl leading-none">
          {winner.name}
        </button>
        <p className="mt-1 text-sm text-muted">
          {winner.total} points{winner.prize ? ` · ${winner.prize}` : ""}
          {mine ? ` · you finished ${placeLabel(mine.place)}` : seatName ? ` · ${seatName} didn’t play` : ""}
        </p>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {season.standings.map((row) => {
          const yours = row.name === seatName;
          return (
            <li key={row.name}>
              <button
                type="button"
                onClick={() => onOpenTeam(row.name)}
                className={`flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-3 text-left ${yours ? "ring-2 ring-ember" : ""}`}
              >
                <NameChip name={row.name} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {placeLabel(row.place)}
                    {yours ? " · you" : ""}
                  </span>
                  <span className="text-xs text-muted">{row.prize ?? "\u00a0"}</span>
                </span>
                <span className="font-display text-3xl leading-none tabular-nums">{row.total}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NameChip({ name }: { name: string }) {
  const known = managers.find((m) => m.name === name);
  if (!known) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-lg bg-surface-2 px-2 py-1 text-sm font-semibold">
        {name}
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg px-2 py-1 text-sm font-semibold"
      style={{ background: known.bg, color: known.fg }}
    >
      {name}
    </span>
  );
}

function placeLabel(place: number): string {
  const mod = place % 100;
  const suffix = mod >= 11 && mod <= 13 ? "th" : place % 10 === 1 ? "st" : place % 10 === 2 ? "nd" : place % 10 === 3 ? "rd" : "th";
  return `${place}${suffix}`;
}
