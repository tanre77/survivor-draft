import { useEffect, useState, type FormEvent } from "react";
import { eraseCustomLeagues, lastDrafter, matchupWinner, newId, nextDrafter, pairSeats, rosterKey, seatColors, takenBy, type CustomLeague, type CustomSeat } from "@/data/custom-leagues";
import { eraseProfile } from "@/data/profile";
import { SEAT_KEY, bonusOf, contestantByName, contestants, displayName, idolCount, isBootPublic, photoSrc, pickPoints, winCount, type Contestant } from "@/data/league";
import { LeagueChat } from "@/components/league-chat";
import { alertsGranted, armTurnAlerts, sameName } from "@/lib/turn-alert";

export function LeagueHome({
  leagues,
  onOpenLive,
  onOpenCustom,
  onCreate,
  onImport,
  profileName,
  onSaveName,
  onJoin,
}: {
  leagues: CustomLeague[];
  onOpenLive: () => void;
  onOpenCustom: (id: string) => void;
  onCreate: () => void;
  onImport: () => void;
  profileName: string;
  onSaveName: (name: string) => void;
  onJoin: (code: string) => Promise<void>;
}) {
  const [legal, setLegal] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinName, setJoinName] = useState(profileName);

  function eraseDevice() {
    eraseCustomLeagues();
    eraseProfile();
    localStorage.removeItem(SEAT_KEY);
    window.location.reload();
  }

  async function join(event: FormEvent) {
    event.preventDefault();
    void armTurnAlerts();
    const name = (profileName || joinName).trim();
    if (!name) {
      setJoinError("Put your name in first.");
      return;
    }
    if (!profileName) onSaveName(name);
    setJoining(true);
    setJoinError("");
    try {
      await onJoin(code);
      setCode("");
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : "That code didn’t work.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">SURVIVOR</p>
      <h1 className="mt-1 font-display text-5xl leading-none">Fantasy Draft</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Survivor 51 is the one in progress. Finished seasons stay on the sheet.
      </p>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onCreate} className="min-h-12 flex-1 rounded-2xl bg-ember text-base font-semibold text-ember-ink">
          New league
        </button>
        <button type="button" onClick={onImport} className="min-h-12 flex-1 rounded-2xl bg-surface text-sm font-semibold">
          Import
        </button>
      </div>
      <form onSubmit={join} className="mt-2 flex flex-col gap-2">
        {!profileName && (
          <input
            value={joinName}
            onChange={(event) => setJoinName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="min-h-12 w-full rounded-2xl bg-surface px-4 text-base"
          />
        )}
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Invite code"
            autoCapitalize="characters"
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 rounded-2xl bg-surface px-4 text-base tracking-widest"
          />
          <button type="submit" disabled={joining} className="min-h-12 rounded-2xl bg-surface px-4 text-sm font-semibold disabled:opacity-40">
            {joining ? "Joining" : "Join"}
          </button>
        </div>
        {joinError && <p className="text-sm text-boot">{joinError}</p>}
      </form>

      <h2 className="mt-6 text-xs font-semibold tracking-widest text-toka">IN PROGRESS</h2>
      <ul className="mt-2 flex flex-col gap-2">
        <li>
          <button type="button" onClick={onOpenLive} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
            <span className="text-xs font-semibold tracking-widest text-toka">LIVE</span>
            <span className="mt-1 block font-display text-4xl leading-none">Survivor 51</span>
            <span className="mt-1 block text-sm text-muted">23 seats · Fiji</span>
          </button>
        </li>
        {leagues.map((league) => {
          const scoredSheet = league.seats.some((seat) => seat.scores != null && seat.scores.length > 0);
          const clock = !scoredSheet && league.drafting !== false ? nextDrafter(league.seats) : null;
          const yours = Boolean(clock && sameName(clock.name, profileName));
          return (
          <li key={league.id}>
            <button type="button" onClick={() => onOpenCustom(league.id)} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
              <span className={`text-xs font-semibold tracking-widest ${yours ? "text-ember" : "text-toka"}`}>
                {yours ? "YOUR TURN" : scoredSheet ? "SCORED" : "IN PROGRESS"}
              </span>
              <span className="mt-1 block font-display text-4xl leading-none">{league.name}</span>
              <span className="mt-1 block text-sm text-muted">
                {yours ? `${clock?.name} is on the clock` : `${league.seats.length} ${league.seats.length === 1 ? "person" : "people"}`}
                {league.trades ? " · trades" : ""}
                {league.bonus ? " · bonus" : ""}
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
            <p>Your seat, profile name, and any leagues you create stay on this device. An invite code stores that league, including the chat, so a friend with the code can join. No location, contacts, camera, or microphone.</p>
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

function seatTotalRank(total: string | undefined): number {
  if (!total) return Number.POSITIVE_INFINITY;
  const match = total.match(/-?\d+(?:\.\d+)?/);
  if (!match) return Number.POSITIVE_INFINITY;
  const value = Number(match[0]);
  const mark = total.includes("+") ? -0.2 : /[−-]/.test(total) ? 0.2 : 0;
  return value + mark;
}

export function CreateLeague({
  you,
  onCancel,
  onCreate,
}: {
  you: string;
  onCancel: () => void;
  onCreate: (league: CustomLeague) => void;
}) {
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [bonus, setBonus] = useState(false);
  const [trades, setTrades] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [headToHead, setHeadToHead] = useState(false);

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
      <p className="mt-2 text-sm text-muted">
        It starts in progress. Survivor 51 stays the live board.
        {you ? ` You join as ${you}.` : " Save your name on the You tab and you’ll be added automatically."}
      </p>

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
        role="switch"
        aria-checked={advanced}
        onClick={() => setAdvanced((on) => !on)}
        className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold">Advanced scoring</span>
          <span className="mt-0.5 block text-sm text-muted">
            {advanced
              ? "On. The first six boots are pre-jury, 2 points apart. The jury is 1 point apart. The winner is still 1."
              : "Off. Pre-jury and jury score the same, one point apart down to the winner."}
          </span>
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full ${advanced ? "bg-toka" : "bg-line"}`}>
          <span className={`absolute top-0.5 size-6 rounded-full bg-fg ${advanced ? "left-5" : "left-0.5"}`} />
        </span>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={headToHead}
        onClick={() => setHeadToHead((on) => !on)}
        className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold">Head to head</span>
          <span className="mt-0.5 block text-sm text-muted">
            {headToHead
              ? "On. Seats pair as 1 vs 2, 3 vs 4. The lower score takes the matchup. An odd seat gets a bye."
              : "Off. The lowest total in the whole league wins."}
          </span>
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full ${headToHead ? "bg-toka" : "bg-line"}`}>
          <span className={`absolute top-0.5 size-6 rounded-full bg-fg ${headToHead ? "left-5" : "left-0.5"}`} />
        </span>
      </button>

      <button
        type="button"
        disabled={!ready && !(you && name.trim())}
        onClick={() => {
          void armTurnAlerts();
          const names = you && !people.some((person) => person.toLowerCase() === you.toLowerCase()) ? [you, ...people] : people;
          if (!name.trim() || names.length === 0) return;
          onCreate({
            id: newId(),
            name: name.trim(),
            bonus,
            trades,
            drafting: true,
            advanced,
            headToHead,
            seats: names.map((person) => ({ id: newId(), name: person, picks: [] })),
          });
        }}
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

function livePoints(seat: CustomSeat): number | null {
  if (seat.scores && seat.scores.length) return seat.scores.reduce((sum, n) => sum + n, 0);
  if (seat.total) {
    const parsed = Number(seat.total.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  let total = 0;
  let any = false;
  for (const pick of seat.picks) {
    const player = contestantByName(pick);
    const points = player ? pickPoints(player) : null;
    if (points == null) continue;
    any = true;
    total += points;
  }
  return any ? total : null;
}

export function CustomBoard({
  league,
  onOpenSeat,
  onAddSeat,
  onCloseDraft,
  onDelete,
  onInvite,
  onShuffle,
  you,
}: {
  league: CustomLeague;
  onOpenSeat: (id: string) => void;
  onAddSeat: (name: string) => void;
  onCloseDraft: () => void;
  onDelete: () => void;
  onInvite: () => void;
  onShuffle: () => void;
  you: string;
}) {
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertsOn, setAlertsOn] = useState(false);

  useEffect(() => {
    setAlertsOn(alertsGranted());
  }, []);

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

  const ranked = [...league.seats].sort((a, b) => {
    if (a.place != null && b.place != null) return a.place - b.place;
    return seatTotalRank(a.total) - seatTotalRank(b.total);
  });
  const scored = league.seats.some((seat) => seat.scores != null && seat.scores.length > 0);
  const clock = league.drafting && !scored ? nextDrafter(league.seats) : null;
  const orderLocked = league.seats.some((seat) => seat.picks.length > 0);
  const rounds = [0, 1, 2, 3].map((round) =>
    league.seats.map((_, slot) => league.seats[round % 2 === 0 ? slot : league.seats.length - 1 - slot].name),
  );

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-toka">{scored ? "FROM THE SHEET" : "IN PROGRESS"}</p>
      <h1 className="mt-1 font-display text-5xl leading-none">{league.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {scored ? (
          "Imported with the sheet’s scores. Lowest total wins."
        ) : (
          <>
            Tap a name to open that team.{" "}
            {league.drafting
              ? league.trades
                ? "Trades are on until the draft closes."
                : "Trades are off."
              : "The draft is closed."}{" "}
            {league.bonus ? "Bonus points are on." : "Bonus points are off."}{" "}
            {league.advanced ? "Advanced scoring is on." : "Standard scoring is on."}{" "}
            {league.headToHead ? "Head to head is on." : "It's a total-points league."}
          </>
        )}
      </p>
      {league.code ? (
        <button
          type="button"
          onClick={() => {
            const share = league.code ?? "";
            void navigator.clipboard?.writeText(share).catch(() => undefined);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 text-left"
        >
          <span>
            <span className="block text-xs font-semibold tracking-widest text-toka">INVITE CODE</span>
            <span className="mt-1 block font-display text-4xl tracking-widest">{`${league.code.slice(0, 3)} ${league.code.slice(3)}`}</span>
          </span>
          <span className="text-sm font-semibold text-muted">{copied ? "Copied" : "Copy"}</span>
        </button>
      ) : (
        <button type="button" onClick={onInvite} className="mt-3 min-h-12 w-full rounded-2xl bg-surface text-sm font-semibold">
          Make an invite code
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          void armTurnAlerts().then(setAlertsOn);
        }}
        className="mt-3 min-h-12 w-full rounded-2xl bg-surface px-4 text-sm font-semibold"
      >
        {alertsOn ? "You'll get an alert on your turn" : "Alert me on my turn"}
      </button>
      {!you && <p className="mt-2 text-sm text-muted">Save your name on the You tab. The alert matches that name to a seat.</p>}
      {league.drafting && !scored && league.seats.length > 1 && (
        <section className="mt-4 rounded-2xl bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-toka">SNAKE DRAFT</p>
              <p className="mt-1 text-sm text-muted">
                {clock ? `${clock.name} is on the clock.` : "Add at least two people."} Last pick of a round goes first in the next.
              </p>
            </div>
            <button
              type="button"
              onClick={onShuffle}
              disabled={orderLocked}
              className="shrink-0 rounded-xl bg-ember px-3 py-2 text-sm font-semibold text-ember-ink disabled:opacity-40"
            >
              Randomize
            </button>
          </div>
          <ol className="mt-3 flex flex-col gap-2">
            {rounds.map((names, round) => (
              <li key={round} className="text-sm">
                <span className="font-semibold">Round {round + 1}. </span>
                <span className="text-muted">{names.join(" · ")}</span>
              </li>
            ))}
          </ol>
          {orderLocked && <p className="mt-2 text-xs text-muted">Order locks after the first pick.</p>}
        </section>
      )}
      {league.headToHead && (
        <section className="mt-4 rounded-2xl bg-surface p-4">
          <p className="text-xs font-semibold tracking-widest text-toka">HEAD TO HEAD</p>
          <p className="mt-1 text-sm text-muted">Pairs follow this order. The lower score wins. An odd seat gets a bye.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {pairSeats(league.seats).map(([a, b]) => {
              const aPoints = livePoints(a);
              const bPoints = b ? livePoints(b) : null;
              const winner = b ? matchupWinner(aPoints, bPoints) : "open";
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-3 text-sm">
                  <span className={winner === "a" ? "font-semibold text-toka" : ""}>
                    {a.name}
                    <span className="ml-2 tabular-nums">{aPoints ?? "—"}</span>
                  </span>
                  <span className="text-muted">{b ? (winner === "tie" ? "Tied" : "vs") : "Bye"}</span>
                  {b && (
                    <span className={`text-right ${winner === "b" ? "font-semibold text-toka" : ""}`}>
                      <span className="mr-2 tabular-nums">{bPoints ?? "—"}</span>
                      {b.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <ul className="mt-4 flex flex-col gap-2">
        {(scored ? ranked : league.seats).map((seat, index) => {
          const color = seatColors(seat.name, index);
          return (
            <li key={seat.id}>
              <button
                type="button"
                onClick={() => onOpenSeat(seat.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-3 text-left"
              >
                <span>
                  <span className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ background: color.bg, color: color.fg }}>
                    {seat.name}
                  </span>
                  {clock?.id === seat.id && <span className="mt-1 block text-xs font-semibold tracking-widest text-toka">ON THE CLOCK</span>}
                  {scored && seat.picks.length > 0 && (
                    <span className="mt-1 block text-sm text-muted">{seat.picks.join(" · ")}</span>
                  )}
                </span>
                <span className="text-right text-sm text-muted">
                  {scored && seat.total ? (
                    <>
                      <span className="block font-display text-3xl leading-none text-fg tabular-nums">{seat.total}</span>
                      {seat.prize ?? (seat.place ? `#${seat.place}` : "")}
                    </>
                  ) : seat.picks.length === 0 ? (
                    "No picks"
                  ) : (
                    `${seat.picks.length} picks`
                  )}
                </span>
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
      <LeagueChat code={league.code} you={you} />
    </div>
  );
}

export function CustomTeam({
  seat,
  seats,
  bonus,
  drafting,
  trades,
  canDraft = true,
  onChange,
  onTrade,
}: {
  seat: CustomSeat;
  seats: CustomSeat[];
  bonus: boolean;
  drafting: boolean;
  trades: boolean;
  canDraft?: boolean;
  onChange: (picks: string[]) => void;
  onTrade: (myIndex: number, otherId: string, theirIndex: number) => void;
}) {
  const [deal, setDeal] = useState<{ mine: number; otherId: string | null } | null>(null);
  const [blocked, setBlocked] = useState("");
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
  const clock = drafting ? nextDrafter(seats) : null;
  const clockMine = !clock || clock.id === seat.id;
  const myTurn = Boolean(drafting && clockMine && canDraft);
  const canUndo = lastDrafter(seats)?.id === seat.id;

  function onTeam(player: Contestant): boolean {
    return seat.picks.some((pick) => contestantByName(pick)?.id === player.id);
  }

  function add(player: Contestant) {
    if (!drafting || !myTurn || onTeam(player)) return;
    const picks = [...seat.picks, displayName(player)];
    const owner = takenBy(seats, picks, [seat.id]);
    if (owner) {
      setBlocked(`${owner} already has that exact team.`);
      return;
    }
    setBlocked("");
    onChange(picks);
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">TEAM</p>
      <h1 className="mt-1 font-display text-5xl leading-none">{seat.name}</h1>
      {bonus && <p className="mt-2 text-sm text-toka">Bonus −{teamBonus} off the score</p>}
      {!drafting && <p className="mt-2 text-sm text-muted">The draft is closed.</p>}
      {drafting && !trades && <p className="mt-2 text-sm text-muted">Trades are off for this league.</p>}
      {drafting && clockMine && !canDraft && (
        <p className="mt-2 text-sm text-muted">This pick belongs to {seat.name}. Your phone only drafts the seat that matches your name.</p>
      )}
      {drafting && !clockMine && clock && <p className="mt-2 text-sm text-muted">Waiting on {clock.name}. The draft snakes, so the last pick of a round goes first in the next.</p>}
      {drafting && myTurn && <p className="mt-2 text-sm font-semibold text-toka">You're on the clock.</p>}
      {drafting && <p className="mt-2 text-sm text-muted">No two seats can draft the same exact team.</p>}
      {blocked && <p className="mt-2 text-sm font-semibold text-boot">{blocked}</p>}
      {seat.picks.length === 0 && <p className="mt-4 text-sm text-muted">No picks yet.</p>}
      <ol className="mt-4 flex flex-col gap-2">
        {seat.picks.map((pick, pickIndex) => {
          const player = contestantByName(pick);
          const out = Boolean(player && isBootPublic(player));
          const points = bonus && player ? bonusOf(player) : 0;
          const idols = bonus && player ? idolCount(player) : 0;
          const wins = bonus && player ? winCount(player) : 0;
          const detail = [
            wins ? `${wins} ${wins === 1 ? "challenge" : "challenges"}` : "",
            idols ? `${idols} ${idols === 1 ? "idol" : "idols"}` : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={`${pick}-${pickIndex}`} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2">
              <span className="flex min-w-0 items-center gap-3">
                {player && (
                  <img
                    src={photoSrc(player.id)}
                    alt=""
                    width={48}
                    height={64}
                    className="h-16 w-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <span className="min-w-0">
                  <span className="block text-xs font-semibold tracking-widest text-muted">PICK {pickIndex + 1}</span>
                  <span className={`block truncate text-base font-semibold ${out ? "text-boot" : ""}`}>{player ? displayName(player) : pick}</span>
                  {bonus && player && points > 0 && (
                    <span className="mt-1 block text-sm text-toka">
                      {detail} · −{points}
                    </span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                {seat.scores?.[pickIndex] != null && (
                  <span className="font-display text-4xl leading-none tabular-nums text-toka">{seat.scores[pickIndex]}</span>
                )}
                {drafting && canTrade && (
                  <button
                    type="button"
                    onClick={() => setDeal({ mine: pickIndex, otherId: null })}
                    className="text-sm font-semibold text-toka"
                  >
                    Trade
                  </button>
                )}
                {drafting && canUndo && pickIndex === seat.picks.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBlocked("");
                      onChange(seat.picks.filter((_, i) => i !== pickIndex));
                    }}
                    className="text-sm font-semibold text-muted"
                  >
                    Remove
                  </button>
                )}
              </span>
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
                  const minePicks = seat.picks.map((pick, index) => (index === deal.mine ? pick : pick));
                  const offered = seat.picks[deal.mine];
                  const wanted = partner.picks[index];
                  if (offered == null || wanted == null) return;
                  minePicks[deal.mine] = wanted;
                  const otherPicks = partner.picks.map((pick, pickIndex) => (pickIndex === index ? offered : pick));
                  const mineHit = takenBy(seats, minePicks, [seat.id, partner.id]);
                  const otherHit = takenBy(seats, otherPicks, [seat.id, partner.id]);
                  const swappedSame = rosterKey(minePicks) !== "" && rosterKey(minePicks) === rosterKey(otherPicks);
                  if (mineHit || otherHit || swappedSame) {
                    const who = mineHit ?? otherHit ?? partner.name;
                    setBlocked(`That trade would copy ${who}'s team.`);
                    return;
                  }
                  setBlocked("");
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
      {drafting && myTurn && (
        <section className="mt-5">
          <h2 className="text-xs font-semibold tracking-widest text-muted">THE CAST</h2>
          <p className="mt-1 text-sm text-muted">Tap a player to draft them.</p>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {contestants.map((player) => {
              const mine = onTeam(player);
              const out = isBootPublic(player);
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    disabled={mine}
                    onClick={() => add(player)}
                    className="w-full overflow-hidden rounded-xl bg-surface text-left disabled:opacity-40"
                  >
                    <img
                      src={photoSrc(player.id)}
                      alt=""
                      width={160}
                      height={214}
                      className={`aspect-[3/4] w-full object-cover ${out ? "opacity-70" : ""}`}
                    />
                    <span className={`block px-2 py-2 text-sm font-semibold leading-tight ${out ? "text-boot" : ""}`}>
                      {player.first}
                      {mine ? <span className="mt-0.5 block text-xs font-semibold text-muted">On your team</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
