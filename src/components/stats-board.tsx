import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { buildTable, placeLabel, type Career, type TableReport } from "@/data/stats";

const table = buildTable();

export function StatsBoard({ seatName }: { seatName?: string }) {
  const [name, setName] = useState<string | null>(null);
  const person = name ? table.careers.find((career) => career.name === name) : undefined;
  if (person) return <Person career={person} onBack={() => setName(null)} />;
  return <Report table={table} seatName={seatName} onOpen={setName} />;
}

function Report({
  table,
  seatName,
  onOpen,
}: {
  table: TableReport;
  seatName?: string;
  onOpen: (name: string) => void;
}) {
  const best = table.slots.reduce((cheap, slot) => (slot.average < cheap.average ? slot : cheap));
  const worst = table.slots.reduce((dear, slot) => (slot.average > dear.average ? slot : dear));
  const max = worst.average || 1;
  const winners = table.careers.filter((career) => career.wins > 0);
  const richest = [...table.careers].sort((a, b) => b.money - a.money).slice(0, 3);
  const span = `${table.seasons[table.seasons.length - 1]}–${table.seasons[0]}`;

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-toka">SEASONS {span}</p>
      <h1 className="mt-1 font-display text-5xl leading-none">The table</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        {table.rosters} finished rosters. Lowest score wins, so a lower number is a better draft spot. Survivor 51 is not in this yet.
      </p>

      <section className="mt-6 rounded-2xl bg-surface p-4">
        <p className="text-xs font-semibold tracking-widest text-toka">BEST DRAFT SPOT</p>
        <h2 className="mt-1 font-display text-4xl leading-none">Pick {best.slot}</h2>
        <p className="mt-2 text-sm text-muted">
          It averages {best.average.toFixed(1)} points. Pick {worst.slot} averages {worst.average.toFixed(1)}, about{" "}
          {(worst.average - best.average).toFixed(1)} points more expensive. A roster’s cheapest player was Pick {best.slot} on{" "}
          {best.timesBest} of {table.rosters} teams.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {table.slots.map((slot) => {
            const leading = slot.slot === best.slot;
            return (
              <li key={slot.slot}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={leading ? "font-semibold text-toka" : "text-fg"}>Pick {slot.slot}</span>
                  <span className={`tabular-nums ${leading ? "font-semibold text-toka" : "text-muted"}`}>
                    {slot.average.toFixed(1)}
                    <span className="text-muted"> avg</span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${leading ? "bg-toka" : "bg-fg/35"}`}
                    style={{ width: `${Math.max(8, (slot.average / max) * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl bg-surface p-4">
        <p className="text-xs font-semibold tracking-widest text-muted">WHAT WON A TITLE</p>
        <h2 className="mt-1 font-display text-3xl leading-none">The winner’s cheapest pick</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {table.slots.map((slot) => (
            <li key={slot.slot} className="flex items-center justify-between text-sm">
              <span>Pick {slot.slot}</span>
              <span className="text-muted tabular-nums">
                {slot.timesWinnerBest === 0 ? "Never the cheapest" : `${slot.timesWinnerBest} title${slot.timesWinnerBest === 1 ? "" : "s"}`}
                {" · "}
                {slot.winnerAverage.toFixed(1)} avg
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold tracking-widest text-muted">CHAMPIONS</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {winners.map((career) => (
            <li key={career.name}>
              <CareerButton career={career} you={career.name === seatName} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold tracking-widest text-muted">THE REST OF THE TABLE</h2>
        <p className="mt-1 text-sm text-muted">
          {richest.map((career) => `${career.name} ${dollars(career.money)}`).join(" · ")}
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {table.careers
            .filter((career) => career.wins === 0)
            .map((career) => (
              <li key={career.name}>
                <CareerButton career={career} you={career.name === seatName} onOpen={onOpen} />
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function CareerButton({ career, you, onOpen }: { career: Career; you: boolean; onOpen: (name: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(career.name)}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left ${you ? "ring-2 ring-ember" : ""}`}
    >
      <span>
        <span className="block text-base font-semibold">
          {career.name}
          {you ? <span className="ml-2 text-xs font-semibold tracking-widest text-ember">YOU</span> : null}
        </span>
        <span className="mt-0.5 block text-sm text-muted">
          {career.wins ? `${career.wins} title${career.wins === 1 ? "" : "s"} · ` : ""}
          {career.seasons} season{career.seasons === 1 ? "" : "s"} · avg place {career.avgPlace.toFixed(1)}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-display text-3xl leading-none tabular-nums">{career.avgScore.toFixed(0)}</span>
        <span className="text-xs text-muted">{career.money ? dollars(career.money) : "no cash"}</span>
      </span>
    </button>
  );
}

function Person({ career, onBack }: { career: Career; onBack: () => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted">
        <ChevronLeft className="size-4" />
        The table
      </button>
      <p className="mt-3 text-xs font-semibold tracking-widest text-toka">
        {career.wins ? `${career.wins} TITLE${career.wins === 1 ? "" : "S"}` : "NO TITLES"} · BEST {placeLabel(career.best).toUpperCase()}
      </p>
      <h1 className="mt-1 font-display text-5xl leading-none">{career.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {career.seasons} seasons · average place {career.avgPlace.toFixed(1)} · average score {career.avgScore.toFixed(1)}
        {career.money ? ` · ${dollars(career.money)}` : ""}. Their cheapest slot on average is Pick {career.bestSlot}.
      </p>
      <ol className="mt-4 flex flex-col gap-2">
        {career.lines.map((line) => (
          <li key={line.season} className="rounded-2xl bg-surface px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span>
                <span className="block text-xs font-semibold tracking-widest text-muted">SEASON {line.season}</span>
                <span className="font-display text-3xl leading-none">{placeLabel(line.place)}</span>
              </span>
              <span className="text-right">
                <span className="block font-display text-3xl leading-none tabular-nums">{line.total}</span>
                <span className="text-xs text-muted">{line.prize ?? "no prize"}</span>
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {line.picks.map((pick, index) => {
                const cheap = index + 1 === line.bestSlot;
                return (
                  <li key={`${line.season}-${pick}`} className="flex items-baseline justify-between text-sm">
                    <span className={cheap ? "font-semibold text-toka" : ""}>
                      {index + 1} · {pick}
                    </span>
                    <span className={`tabular-nums ${cheap ? "font-semibold text-toka" : "text-muted"}`}>{line.scores[index]}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function dollars(amount: number): string {
  return `$${Math.round(amount)}`;
}
