import { useState } from "react";
import { pastSeasons } from "@/data/history";
import { eraseCustomLeagues, newId, seatColors, type CustomLeague, type CustomSeat } from "@/data/custom-leagues";
import { SEAT_KEY, bonusOf, contestantByName, idolCount, winCount } from "@/data/league";

export function LeagueHome({
  leagues,
  onOpenLive,
  onOpenCustom,
  onCreate,
  onOpenPast,
}: {
  leagues: CustomLeague[];
  onOpenLive: () => void;
  onOpenCustom: (id: string) => void;
  onCreate: () => void;
  onOpenPast: (id: string) => void;
}) {
  const [legal, setLegal] = useState(false);
  const [erasing, setErasing] = useState(false);

  function eraseDevice() {
    eraseCustomLeagues();
    localStorage.removeItem(SEAT_KEY);
    window.location.reload();
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">DRAFTS</p>
      <h1 className="mt-1 font-display text-5xl leading-none">Leagues</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Survivor 51 is the one in progress. Finished seasons stay on the sheet. Start another league when this isn’t the table.
      </p>

      <h2 className="mt-6 text-xs font-semibold tracking-widest text-toka">IN PROGRESS</h2>
      <ul className="mt-2 flex flex-col gap-2">
        <li>
          <button type="button" onClick={onOpenLive} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
            <span className="text-xs font-semibold tracking-widest text-toka">LIVE</span>
            <span className="mt-1 block font-display text-4xl leading-none">Survivor 51</span>
            <span className="mt-1 block text-sm text-muted">23 seats · Fiji</span>
          </button>
        </li>
        {leagues.map((league) => (
          <li key={league.id}>
            <button type="button" onClick={() => onOpenCustom(league.id)} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
              <span className="text-xs font-semibold tracking-widest text-toka">IN PROGRESS</span>
              <span className="mt-1 block font-display text-4xl leading-none">{league.name}</span>
              <span className="mt-1 block text-sm text-muted">
                {league.seats.length} {league.seats.length === 1 ? "person" : "people"}
                {league.trades ? " · trades" : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onCreate} className="mt-3 min-h-12 w-full rounded-2xl bg-ember text-base font-semibold text-ember-ink">
        New league
      </button>

      <h2 className="mt-8 text-xs font-semibold tracking-widest text-muted">FINISHED</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {pastSeasons.map((season) => {
          const winner = season.standings[0];
          return (
            <li key={season.id}>
              <button type="button" onClick={() => onOpenPast(season.id)} className="w-full rounded-2xl bg-surface px-4 py-3 text-left">
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

      <div className="mt-8 rounded-2xl bg-surface px-4 py-4">
        <button type="button" onClick={() => setLegal((open) => !open)} className="text-sm font-semibold">
          {legal ? "Hide privacy" : "Privacy and support"}
        </button>
        {legal && (
          <div className="mt-3 flex flex-col gap-3 text-sm text-muted">
            <p>This is a private family scoreboard. It does not take payment, sell data, or require an account.</p>
            <p>Your seat and any leagues you create stay on this device. Cast photos only identify picks. No location, contacts, camera, or microphone.</p>
            <p>Crash reports stay off until a Firebase config is added. Crashlytics is for the iOS and Android apps, not the browser.</p>
            <p>
              <a className="font-semibold text-toka" href="/privacy.html">Privacy</a>
              {" · "}
              <a className="font-semibold text-toka" href="/support.html">Support</a>
            </p>
          </div>
        )}
        {!erasing ? (
          <button type="button" onClick={() => setErasing(true)} className="mt-4 text-sm font-semibold text-muted">
            Erase this device
          </button>
        ) : (
          <button type="button" onClick={eraseDevice} className="mt-4 text-sm font-semibold text-ember">
            Erase the saved seat and leagues
          </button>
        )}
      </div>
    </div>
  );
}

export function CreateLeague({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (league: CustomLeague) => void;
}) {
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [bonus, setBonus] = useState(false);
  const [trades, setTrades] = useState(false);

  function addPerson() {
    const next = draft.trim();
    if (!next) return;
    if (people.some((p) => p.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    setPeople((list) => [...list, next]);
    setDraft("");
  }

  const ready = name.trim().length > 0 && people.length > 0;

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">OUTSIDE SURVIVOR 51</p>
      <h1 className="mt-1 font-display text-5xl leading-none">New league</h1>
      <p className="mt-2 text-sm text-muted">It starts in progress. Survivor 51 stays the live board.</p>

      <label className="mt-5 block text-sm font-semibold">
        League name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
          autoComplete="off"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        Add a person
        <span className="mt-1 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPerson();
              }
            }}
            className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
            autoComplete="off"
          />
          <button type="button" onClick={addPerson} className="min-h-12 rounded-xl bg-fg px-4 text-base font-semibold text-bg">
            Add
          </button>
        </span>
      </label>

      {people.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {people.map((person, index) => {
            const color = seatColors(person, index);
            return (
              <li key={person} className="flex items-center justify-between gap-3">
                <span className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ background: color.bg, color: color.fg }}>
                  {person}
                </span>
                <button
                  type="button"
                  onClick={() => setPeople((list) => list.filter((p) => p !== person))}
                  className="text-sm font-semibold text-muted"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={bonus}
        onClick={() => setBonus((on) => !on)}
        className="mt-5 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold">Bonus points</span>
          <span className="mt-0.5 block text-sm text-muted">
            {bonus ? "Each idol and each challenge win is −1." : "Off. Idols and challenge wins stay off the score."}
          </span>
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full ${bonus ? "bg-toka" : "bg-line"}`}>
          <span className={`absolute top-0.5 size-6 rounded-full bg-fg ${bonus ? "left-5" : "left-0.5"}`} />
        </span>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={trades}
        onClick={() => setTrades((on) => !on)}
        className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold">Trades</span>
          <span className="mt-0.5 block text-sm text-muted">
            {trades ? "On while the draft is open. Off once you close it." : "Off. Nobody can swap picks."}
          </span>
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full ${trades ? "bg-toka" : "bg-line"}`}>
          <span className={`absolute top-0.5 size-6 rounded-full bg-fg ${trades ? "left-5" : "left-0.5"}`} />
        </span>
      </button>

      <button
        type="button"
        disabled={!ready}
        onClick={() =>
          onCreate({
            id: newId(),
            name: name.trim(),
            bonus,
            trades,
            drafting: true,
            seats: people.map((person) => ({ id: newId(), name: person, picks: [] })),
          })
        }
        className="mt-6 min-h-12 w-full rounded-2xl bg-ember text-base font-semibold text-ember-ink disabled:opacity-40"
      >
        Start league
      </button>
      <button type="button" onClick={onCancel} className="mt-3 min-h-11 w-full text-sm font-semibold text-muted">
        Cancel
      </button>
    </div>
  );
}

export function CustomBoard({
  league,
  onOpenSeat,
  onAddSeat,
  onCloseDraft,
  onDelete,
}: {
  league: CustomLeague;
  onOpenSeat: (id: string) => void;
  onAddSeat: (name: string) => void;
  onCloseDraft: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(false);
  const [closing, setClosing] = useState(false);

  function add() {
    const next = draft.trim();
    if (!next) return;
    if (league.seats.some((s) => s.name.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onAddSeat(next);
    setDraft("");
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-toka">IN PROGRESS</p>
      <h1 className="mt-1 font-display text-5xl leading-none">{league.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Tap a name to open that team.{" "}
        {league.drafting
          ? league.trades
            ? "Trades are on until the draft closes."
            : "Trades are off."
          : "The draft is closed."}{" "}
        {league.bonus ? "Bonus points are on." : "Bonus points are off."}
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {league.seats.map((seat, index) => {
          const color = seatColors(seat.name, index);
          return (
            <li key={seat.id}>
              <button
                type="button"
                onClick={() => onOpenSeat(seat.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-3 text-left"
              >
                <span className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ background: color.bg, color: color.fg }}>
                  {seat.name}
                </span>
                <span className="text-sm text-muted">{seat.picks.length === 0 ? "No picks" : `${seat.picks.length} picks`}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {league.drafting && (
        <label className="mt-4 block text-sm font-semibold">
        Add a person
        <span className="mt-1 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
            autoComplete="off"
          />
          <button type="button" onClick={add} className="min-h-12 rounded-xl bg-fg px-4 text-base font-semibold text-bg">
            Add
          </button>
        </span>
      </label>
      )}
      {league.drafting &&
        (!closing ? (
          <button type="button" onClick={() => setClosing(true)} className="mt-6 text-sm font-semibold text-muted">
            Close the draft
          </button>
        ) : (
          <button type="button" onClick={onCloseDraft} className="mt-6 text-sm font-semibold text-ember">
            Close it. No more picks or trades.
          </button>
        ))}
      {!armed ? (
        <button type="button" onClick={() => setArmed(true)} className="mt-8 text-sm font-semibold text-muted">
          Delete league
        </button>
      ) : (
        <button type="button" onClick={onDelete} className="mt-8 text-sm font-semibold text-ember">
          Delete {league.name}
        </button>
      )}
    </div>
  );
}

export function CustomTeam({
  seat,
  seats,
  bonus,
  drafting,
  trades,
  onChange,
  onTrade,
}: {
  seat: CustomSeat;
  seats: CustomSeat[];
  bonus: boolean;
  drafting: boolean;
  trades: boolean;
  onChange: (picks: string[]) => void;
  onTrade: (myIndex: number, otherId: string, theirIndex: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const [deal, setDeal] = useState<{ mine: number; otherId: string | null } | null>(null);
  const scored = bonus
    ? seat.picks.map((pick) => {
        const player = contestantByName(pick);
        return player ? bonusOf(player) : 0;
      })
    : [];
  const teamBonus = scored.reduce((sum, n) => sum + n, 0);
  const others = seats.filter((other) => other.id !== seat.id && other.picks.length > 0);
  const partner = deal?.otherId ? seats.find((other) => other.id === deal.otherId) : undefined;
  const canTrade = drafting && trades;

  function add() {
    const next = draft.trim();
    if (!next || !drafting) return;
    onChange([...seat.picks, next]);
    setDraft("");
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">TEAM</p>
      <h1 className="mt-1 font-display text-5xl leading-none">{seat.name}</h1>
      {bonus && <p className="mt-2 text-sm text-toka">Bonus −{teamBonus} off the score</p>}
      {!drafting && <p className="mt-2 text-sm text-muted">The draft is closed.</p>}
      {drafting && !trades && <p className="mt-2 text-sm text-muted">Trades are off for this league.</p>}
      {seat.picks.length === 0 && <p className="mt-4 text-sm text-muted">No picks yet.</p>}
      <ol className="mt-4 flex flex-col gap-2">
        {seat.picks.map((pick, pickIndex) => {
          const player = bonus ? contestantByName(pick) : null;
          const points = player ? bonusOf(player) : 0;
          const idols = player ? idolCount(player) : 0;
          const wins = player ? winCount(player) : 0;
          const detail = [
            wins ? `${wins} ${wins === 1 ? "challenge" : "challenges"}` : "",
            idols ? `${idols} ${idols === 1 ? "idol" : "idols"}` : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={`${pick}-${pickIndex}`} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
              <span>
                <span className="block text-xs font-semibold tracking-widest text-muted">PICK {pickIndex + 1}</span>
                <span className="text-base font-semibold">{pick}</span>
                {bonus && player && points > 0 && (
                  <span className="mt-1 block text-sm text-toka">
                    {detail} · −{points}
                  </span>
                )}
              </span>
              {drafting && (
                <span className="flex shrink-0 gap-3">
                  {canTrade && (
                    <button
                      type="button"
                      onClick={() => setDeal({ mine: pickIndex, otherId: null })}
                      className="text-sm font-semibold text-toka"
                    >
                      Trade
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(seat.picks.filter((_, i) => i !== pickIndex))}
                    className="text-sm font-semibold text-muted"
                  >
                    Remove
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {canTrade && deal && (
        <div className="mt-4 rounded-2xl bg-surface p-4">
          <p className="text-sm font-semibold">Trade {seat.picks[deal.mine]}</p>
          {!partner && others.length === 0 && <p className="mt-2 text-sm text-muted">Nobody else has a pick yet.</p>}
          {!partner &&
            others.map((other) => (
              <button
                key={other.id}
                type="button"
                onClick={() => setDeal({ mine: deal.mine, otherId: other.id })}
                className="mt-2 flex min-h-11 w-full items-center text-left text-sm font-semibold"
              >
                {other.name}
              </button>
            ))}
          {partner &&
            partner.picks.map((pick, index) => (
              <button
                key={`${pick}-${index}`}
                type="button"
                onClick={() => {
                  onTrade(deal.mine, partner.id, index);
                  setDeal(null);
                }}
                className="mt-2 flex min-h-11 w-full items-center text-left text-sm font-semibold"
              >
                For {partner.name}'s {pick}
              </button>
            ))}
          <button type="button" onClick={() => setDeal(null)} className="mt-3 text-sm font-semibold text-muted">
            Cancel
          </button>
        </div>
      )}
      {drafting && (
      <label className="mt-4 block text-sm font-semibold">
        Add a pick
        <span className="mt-1 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
            autoComplete="off"
          />
          <button type="button" onClick={add} className="min-h-12 rounded-xl bg-ember px-4 text-base font-semibold text-ember-ink">
            Add
          </button>
        </span>
      </label>
      )}
    </div>
  );
}
