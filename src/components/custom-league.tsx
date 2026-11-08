import { useState } from "react";
import { lastDrafter, matchupWinner, newId, nextDrafter, pairSeats, rosterKey, seatColors, takenBy, type CustomLeague, type CustomSeat, type SeatReach } from "@/data/custom-leagues";
import { advancedBonus, bonusOf, contestantByName, contestants, displayName, idolCount, isBootPublic, photoSrc, pickPoints, playCount, voteCount, winCount, advantageCount, type Contestant } from "@/data/league";
import { LeagueChat } from "@/components/league-chat";
import { sameName } from "@/lib/turn-alert";
import { copyText } from "@/lib/copy";
import { inviteUrl } from "@/data/invite";
import { loadProfile, normalizeEmail } from "@/data/profile";
import { saveTurnAlert, notifyTurn } from "@/lib/turn-mail";

function seatTotalRank(total: string | undefined): number {
  if (!total) return Number.POSITIVE_INFINITY;
  const match = total.match(/-?\d+(?:\.\d+)?/);
  if (!match) return Number.POSITIVE_INFINITY;
  const value = Number(match[0]);
  const mark = total.includes("+") ? -0.2 : /[−-]/.test(total) ? 0.2 : 0;
  return value + mark;
}

const REACH: { id: SeatReach["kind"]; label: string; placeholder: string }[] = [
  { id: "email", label: "Email", placeholder: "you@email.com" },
  { id: "google", label: "Google", placeholder: "Google account email" },
  { id: "twitter", label: "Twitter", placeholder: "@handle" },
];

function ReachPicker({
  kind,
  value,
  onKind,
  onValue,
}: {
  kind: SeatReach["kind"];
  value: string;
  onKind: (kind: SeatReach["kind"]) => void;
  onValue: (value: string) => void;
}) {
  const field = REACH.find((item) => item.id === kind) ?? REACH[0];
  return (
    <div className="mt-3">
      <p className="text-sm font-semibold">How to reach them</p>
      <div className="mt-2 flex gap-2">
        {REACH.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={kind === item.id}
            onClick={() => onKind(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${kind === item.id ? "bg-toka text-toka-ink" : "bg-surface text-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <input
        value={value}
        onChange={(event) => onValue(event.target.value)}
        placeholder={field.placeholder}
        autoComplete={kind === "twitter" ? "off" : "email"}
        inputMode={kind === "twitter" ? "text" : "email"}
        className="mt-2 w-full rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
      />
    </div>
  );
}

export function CreateLeague({
  you,
  onCancel,
  onCreate,
}: {
  you: string;
  onCancel: () => void;
  onCreate: (league: CustomLeague, invite?: string) => Promise<string | void> | void;
}) {
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<SeatReach["kind"]>("email");
  const [contact, setContact] = useState("");
  const [people, setPeople] = useState<{ name: string; reach?: SeatReach }[]>([]);
  const [bonus, setBonus] = useState(false);
  const [trades, setTrades] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [headToHead, setHeadToHead] = useState(false);
  const [inviting, setInviting] = useState("");
  const [inviteNote, setInviteNote] = useState("");

  function roster(): { name: string; reach?: SeatReach }[] {
    const youSeat = you ? [{ name: you }] : [];
    const rest = people.filter((person) => person.name.toLowerCase() !== you.toLowerCase());
    return you ? [...youSeat, ...rest] : people;
  }

  function buildLeague(): CustomLeague | null {
    const names = roster();
    if (!name.trim() || names.length === 0) return null;
    return {
      id: newId(),
      name: name.trim(),
      bonus,
      trades,
      drafting: true,
      advanced,
      headToHead,
      seats: names.map((person) => ({
        id: newId(),
        name: person.name,
        picks: [],
        ...(person.reach ? { reach: person.reach } : {}),
      })),
    };
  }

  async function invitePerson(person: string) {
    if (!name.trim()) {
      setInviteNote("Name the league first.");
      return;
    }
    const league = buildLeague();
    if (!league) return;
    setInviting(person);
    setInviteNote("");
    try {
      const code = await onCreate(league, person);
      if (!code || typeof window === "undefined") {
        setInviteNote("Couldn't make the invite link. Start the league and try Invite there.");
        return;
      }
      const share = inviteUrl(window.location.origin, code, person);
      await copyText(share);
      const nav = navigator as Navigator & { share?: (data: { title: string; text: string; url: string }) => Promise<void> };
      if (nav.share) {
        await nav
          .share({ title: `${person} is in ${league.name}`, text: `${person}, you're in ${league.name}. Open this to draft from your phone.`, url: share })
          .catch(async () => {
            await copyText(share);
          });
      } else {
        await copyText(share);
      }
    } finally {
      setInviting("");
    }
  }

  function addPerson() {
    const next = draft.trim();
    if (!next) return;
    if (people.some((person) => person.name.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    const value = contact.trim();
    const reach = value ? ({ kind, value: kind === "twitter" ? value.replace(/^@/, "") : value } satisfies SeatReach) : undefined;
    setPeople((list) => [...list, { name: next, ...(reach ? { reach } : {}) }]);
    setDraft("");
    setContact("");
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
      <ReachPicker kind={kind} value={contact} onKind={setKind} onValue={setContact} />

      {people.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {people.map((person, index) => {
            const color = seatColors(person.name, index);
            return (
              <li key={person.name} className="flex items-center justify-between gap-3">
                <span>
                  <span className="rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-fg/15" style={{ background: color.bg, color: color.fg }}>
                    {person.name}
                  </span>
                  {person.reach && (
                    <span className="mt-1 block text-xs text-muted">
                      {person.reach.kind === "twitter" ? `@${person.reach.value}` : person.reach.value}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void invitePerson(person.name)}
                    disabled={inviting !== ""}
                    className="text-sm font-semibold text-toka disabled:opacity-40"
                  >
                    {inviting === person.name ? "Inviting" : "Invite"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeople((list) => list.filter((item) => item.name !== person.name))}
                    className="text-sm font-semibold text-muted"
                  >
                    Remove
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {inviteNote && <p className="mt-2 text-sm text-boot">{inviteNote}</p>}

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
              ? "On. Pre-jury boots are 2 points apart. An idol or advantage is −2, a save is −5, an immunity win is −1, and a final tribal vote is −1."
              : "Off. Finish place only. Idols, advantages, immunity, and votes stay off the score."}
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
          const league = buildLeague();
          if (!league) return;
          void onCreate(league);
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

function livePoints(seat: CustomSeat, advanced = false): number | null {
  if (seat.scores && seat.scores.length) return seat.scores.reduce((sum, n) => sum + n, 0);
  if (seat.total) {
    const parsed = Number(seat.total.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  let total = 0;
  let any = false;
  for (const pick of seat.picks) {
    const player = contestantByName(pick);
    if (!player) continue;
    const finish = pickPoints(player);
    const extra = advanced ? advancedBonus(player) : 0;
    if (finish == null && extra === 0) continue;
    any = true;
    total += (finish ?? 0) - extra;
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
  onDraft,
  you,
  invited,
  inviteError,
}: {
  league: CustomLeague;
  onOpenSeat: (id: string) => void;
  onAddSeat: (name: string, reach?: SeatReach) => void;
  onCloseDraft: () => void;
  onDelete: () => void;
  onInvite: () => void;
  onShuffle: () => void;
  onDraft: (seatId: string, picks: string[]) => string | void;
  you: string;
  invited: string | null;
  inviteError: string;
}) {
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<SeatReach["kind"]>("email");
  const [contact, setContact] = useState("");
  const [armed, setArmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [alertsOn, setAlertsOn] = useState(false);
  const [alertNote, setAlertNote] = useState("");
  const [pickError, setPickError] = useState("");
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const leagueLink = league.code && origin ? inviteUrl(origin, league.code) : "";
  const memberLink = invited && league.code && origin ? inviteUrl(origin, league.code, invited) : "";
  const mine = league.seats.find((seat) => sameName(seat.name, you));

  function timesTaken(player: Contestant): number {
    return league.seats.reduce(
      (sum, seat) => sum + seat.picks.filter((pick) => contestantByName(pick)?.id === player.id).length,
      0,
    );
  }

  function draftPlayer(player: Contestant) {
    if (!clock || !mine || clock.id !== mine.id) {
      setPickError("It's not your turn.");
      return;
    }
    if (isBootPublic(player)) {
      setPickError(`${player.first} is already out.`);
      return;
    }
    if (clock.picks.length >= 3) {
      setPickError("Your team already has 3 picks.");
      return;
    }
    if (clock.picks.some((pick) => contestantByName(pick)?.id === player.id)) {
      setPickError(`${player.first} is already on your team.`);
      return;
    }
    if (timesTaken(player) >= 4) {
      setPickError(`${player.first} is already on 4 teams.`);
      return;
    }
    const picks = [...clock.picks, displayName(player)];
    const owner = takenBy(league.seats, picks, [clock.id]);
    if (owner) {
      setPickError(`${owner} already has that exact team.`);
      return;
    }
    const reason = onDraft(clock.id, picks);
    if (reason) {
      setPickError(reason);
      return;
    }
    setPickError("");
    setChoiceId(null);
  }

  async function shareInvite(name: string) {
    if (!league.code || !origin) {
      onInvite();
      return;
    }
    const share = inviteUrl(origin, league.code, name);
    const copied = await copyText(share);
    if (copied) {
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1500);
    }
    const nav = navigator as Navigator & { share?: (data: { title: string; text: string; url: string }) => Promise<void> };
    if (nav.share) {
      void nav
        .share({ title: `${name} is in ${league.name}`, text: `${name}, you're in ${league.name}. Open this to draft from your phone.`, url: share })
        .catch(() => undefined);
    }
  }

  function add() {
    const next = draft.trim();
    if (!next) return;
    if (league.seats.some((s) => s.name.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    const value = contact.trim();
    const reach = value ? ({ kind, value: kind === "twitter" ? value.replace(/^@/, "") : value } satisfies SeatReach) : undefined;
    onAddSeat(next, reach);
    setDraft("");
    setContact("");
    if (league.code) shareInvite(next);
  }

  const scored = league.seats.some((seat) => seat.scores != null && seat.scores.length > 0);
  const ranked = [...league.seats].sort((a, b) => {
    if (a.place != null && b.place != null) return a.place - b.place;
    return seatTotalRank(a.total) - seatTotalRank(b.total);
  });
  const drafted = !league.drafting && !scored;
  const standings = scored
    ? ranked
    : drafted
      ? [...league.seats].sort((a, b) => {
          const left = livePoints(a, league.advanced);
          const right = livePoints(b, league.advanced);
          if (left == null && right == null) return 0;
          if (left == null) return 1;
          if (right == null) return -1;
          return left - right;
        })
      : league.seats;
  const clock = league.drafting && !scored ? nextDrafter(league.seats) : null;
  const myTurn = Boolean(clock && mine && clock.id === mine.id);
  const chosen = myTurn ? contestants.find((player) => player.id === choiceId) : undefined;
  const orderLocked = league.seats.some((seat) => seat.picks.length > 0);
  const rounds = [0, 1, 2].map((round) =>
    league.seats.map((_, slot) => league.seats[round % 2 === 0 ? slot : league.seats.length - 1 - slot].name),
  );

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-toka">
        {scored ? "FROM THE SHEET" : league.drafting ? "IN PROGRESS" : "LEAGUE"}
      </p>
      <h1 className="mt-1 font-display text-5xl leading-none">{league.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {scored ? (
          "Imported with the sheet’s scores. Lowest total wins."
        ) : !league.drafting ? (
          "The draft is in. This is the league. Lowest total wins."
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
            if (!leagueLink) return;
            void copyText(leagueLink).then((ok) => {
              setCopied(ok);
              setCopyFailed(!ok);
              if (ok) window.setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 text-left"
        >
          <span>
            <span className="block text-xs font-semibold tracking-widest text-toka">INVITE LINK</span>
            <span className="mt-1 block break-all text-sm">{leagueLink}</span>
            <span className="mt-1 block font-display text-3xl tracking-widest">{`${league.code.slice(0, 3)} ${league.code.slice(3)}`}</span>
          </span>
          <span className="text-sm font-semibold text-muted">{copied ? "Copied" : copyFailed ? "Not copied" : "Copy link"}</span>
        </button>
      ) : (
        <button type="button" onClick={onInvite} className="mt-3 min-h-12 w-full rounded-2xl bg-surface text-sm font-semibold">
          Make an invite link
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          const profile = loadProfile();
          if (!profile.email) {
            setAlertNote("Add an email on the You tab first.");
            setAlertsOn(false);
            return;
          }
          if (!you) {
            setAlertNote("Save your name on the You tab first.");
            return;
          }
          if (!league.code) {
            setAlertNote("Make an invite link first, then turn alerts on.");
            onInvite();
            return;
          }
          setAlertNote("");
          void saveTurnAlert({ data: { code: league.code, name: you, email: profile.email } })
            .then(() => {
              setAlertsOn(true);
              setAlertNote(`We'll email ${profile.email} when it's your turn.`);
              return notifyTurn({
                data: {
                  code: league.code ?? "",
                  league: league.name,
                  drafting: league.drafting !== false,
                  origin: window.location.origin,
                  seats: league.seats,
                },
              });
            })
            .catch(() => setAlertNote("Couldn't save that email. Try again."));
        }}
        className="mt-3 min-h-12 w-full rounded-2xl bg-surface px-4 text-sm font-semibold"
      >
        {alertsOn ? "You'll get an email on your turn" : "Email me on my turn"}
      </button>
      {alertNote && <p className="mt-2 text-sm text-muted">{alertNote}</p>}
      {!you && <p className="mt-2 text-sm text-muted">Save your name on the You tab. The alert matches that name to a seat.</p>}
      {league.drafting && (
        <>
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
              {league.code ? "Add & invite" : "Add"}
            </button>
          </span>
        </label>
        <ReachPicker kind={kind} value={contact} onKind={setKind} onValue={setContact} />
        </>
      )}
      {invited && (
        <div className="mt-3 rounded-2xl bg-surface px-4 py-3">
          <p className="text-xs font-semibold tracking-widest text-toka">INVITE FOR {invited.toUpperCase()}</p>
          {memberLink ? (
            <>
              <p className="mt-2 break-all text-sm">{memberLink}</p>
              <p className="mt-1 text-sm text-muted">Send this to {invited}. Opening it puts them in the draft room.</p>
              <button
                type="button"
                onClick={() => shareInvite(invited)}
                className="mt-3 min-h-12 w-full rounded-2xl bg-ember text-sm font-semibold text-ember-ink"
              >
                {linkCopied ? "Copied" : `Invite ${invited}`}
              </button>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">{inviteError || "Making the invite link…"}</p>
          )}
        </div>
      )}
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
      {league.drafting && !scored && (
        <section className="mt-4 rounded-2xl bg-surface p-4">
          <p className="text-xs font-semibold tracking-widest text-toka">DRAFT ROOM</p>
          <h2 className="mt-1 font-display text-4xl leading-none">
            {clock ? `${clock.name} is on the clock` : "The board is full"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Everyone drafts from their own phone. Picks show up here for the whole room.
            {!league.code ? " Make an invite link so the others can get in." : ""}
          </p>
          {!you && <p className="mt-2 text-sm text-muted">Save your name on the You tab. This phone can only draft the seat with that name.</p>}
          {you && !mine && <p className="mt-2 text-sm text-muted">{you} isn't a seat in this room.</p>}
          {myTurn && <p className="mt-2 text-sm font-semibold text-toka">Your turn. Choose one player, then submit.</p>}
          {clock && !myTurn && mine && <p className="mt-2 text-sm text-muted">Waiting on {clock.name}.</p>}
          {pickError && <p className="mt-2 text-sm font-semibold text-boot">{pickError}</p>}
          <ul className="mt-3 flex flex-col gap-2">
            {league.seats.map((seat, index) => (
              <li key={seat.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                <button type="button" onClick={() => onOpenSeat(seat.id)} className="min-w-0 flex-1 text-left">
                  <span className={`block text-sm font-semibold ${clock?.id === seat.id ? "text-toka" : ""}`}>
                    {index + 1}. {seat.name}
                    {sameName(seat.name, you) ? " · you" : ""}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted">{seat.picks.length === 0 ? "No picks" : seat.picks.join(" · ")}</span>
                </button>
                {!sameName(seat.name, you) && (
                  <button type="button" onClick={() => shareInvite(seat.name)} className="shrink-0 text-sm font-semibold text-toka">
                    Invite
                  </button>
                )}
              </li>
            ))}
          </ul>
          {myTurn && (
            <ul className="mt-4 grid grid-cols-3 gap-2 pb-24">
              {contestants.filter((player) => !isBootPublic(player)).map((player) => {
                  const owned = clock?.picks.some((pick) => contestantByName(pick)?.id === player.id);
                  const full = timesTaken(player) >= 4;
                  const selected = choiceId === player.id;
                  return (
                    <li key={player.id}>
                      <button
                        type="button"
                        disabled={owned || full}
                        aria-pressed={selected}
                        onClick={() => {
                          setPickError("");
                          setChoiceId((current) => (current === player.id ? null : player.id));
                        }}
                        className={`w-full overflow-hidden rounded-xl bg-bg text-left disabled:opacity-40 ${selected ? "ring-2 ring-ember" : ""}`}
                      >
                        <img src={photoSrc(player.id)} alt="" width={160} height={214} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover" />
                        <span className="block px-2 py-2 text-sm font-semibold leading-tight">
                          {player.first}
                          {selected ? <span className="mt-0.5 block text-xs font-semibold text-ember">Your pick</span> : null}
                          {owned ? <span className="mt-0.5 block text-xs font-semibold text-muted">On your team</span> : null}
                          {!owned && full ? <span className="mt-0.5 block text-xs font-semibold text-muted">Drafted 4 times</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
          )}
        </section>
      )}
      {chosen && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={() => draftPlayer(chosen)}
            className="mx-auto block min-h-12 w-full max-w-5xl rounded-2xl bg-ember text-base font-semibold text-ember-ink"
          >
            Submit {chosen.first} to your team
          </button>
        </div>
      )}
      {league.headToHead && (
        <section className="mt-4 rounded-2xl bg-surface p-4">
          <p className="text-xs font-semibold tracking-widest text-toka">HEAD TO HEAD</p>
          <p className="mt-1 text-sm text-muted">Pairs follow this order. The lower score wins. An odd seat gets a bye.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {pairSeats(league.seats).map(([a, b]) => {
              const aPoints = livePoints(a, league.advanced);
              const bPoints = b ? livePoints(b, league.advanced) : null;
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
        {standings.map((seat, index) => {
          const color = seatColors(seat.name, index);
          const points = drafted ? livePoints(seat, league.advanced) : null;
          return (
            <li key={seat.id}>
              <button
                type="button"
                onClick={() => onOpenSeat(seat.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-3 text-left"
              >
                <span>
                  <span className="rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ring-fg/15" style={{ background: color.bg, color: color.fg }}>
                    {seat.name}
                  </span>
                  {clock?.id === seat.id && <span className="mt-1 block text-xs font-semibold tracking-widest text-toka">ON THE CLOCK</span>}
                  {(scored || drafted) && seat.picks.length > 0 && (
                    <span className="mt-1 block text-sm text-muted">{seat.picks.join(" · ")}</span>
                  )}
                </span>
                <span className="text-right text-sm text-muted">
                  {scored && seat.total ? (
                    <>
                      <span className="block font-display text-3xl leading-none text-fg tabular-nums">{seat.total}</span>
                      {seat.prize ?? (seat.place ? `#${seat.place}` : "")}
                    </>
                  ) : drafted ? (
                    <span className="block font-display text-3xl leading-none text-fg tabular-nums">{points ?? "—"}</span>
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
  advanced = false,
  drafting,
  trades,
  canDraft = true,
  onChange,
  onTrade,
}: {
  seat: CustomSeat;
  seats: CustomSeat[];
  bonus: boolean;
  advanced?: boolean;
  drafting: boolean;
  trades: boolean;
  canDraft?: boolean;
  onChange: (picks: string[]) => string | void;
  onTrade: (myIndex: number, otherId: string, theirIndex: number) => void;
}) {
  const [deal, setDeal] = useState<{ mine: number; otherId: string | null } | null>(null);
  const [blocked, setBlocked] = useState("");
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const scored = seat.picks.map((pick) => {
    const player = contestantByName(pick);
    if (!player) return 0;
    if (advanced) return advancedBonus(player);
    return bonus ? bonusOf(player) : 0;
  });
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

  function timesTaken(player: Contestant): number {
    return seats.reduce(
      (sum, other) => sum + other.picks.filter((pick) => contestantByName(pick)?.id === player.id).length,
      0,
    );
  }

  function add(player: Contestant): boolean {
    if (!drafting || !myTurn || onTeam(player) || isBootPublic(player)) {
      setBlocked(myTurn ? "That player can't go on your team." : "It's not your turn.");
      return false;
    }
    if (seat.picks.length >= 3) {
      setBlocked("Your team already has 3 picks.");
      return false;
    }
    if (timesTaken(player) >= 4) {
      setBlocked(`${player.first} is already on 4 teams.`);
      return false;
    }
    const picks = [...seat.picks, displayName(player)];
    const owner = takenBy(seats, picks, [seat.id]);
    if (owner) {
      setBlocked(`${owner} already has that exact team.`);
      return false;
    }
    const reason = onChange(picks);
    if (reason) {
      setBlocked(reason);
      return false;
    }
    setBlocked("");
    return true;
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">TEAM</p>
      <h1 className="mt-1 font-display text-5xl leading-none">{seat.name}</h1>
      {(advanced || bonus) && teamBonus > 0 && (
        <p className="mt-2 text-sm text-toka">{advanced ? "Advanced" : "Bonus"} −{teamBonus} off the score</p>
      )}
      {!drafting && <p className="mt-2 text-sm text-muted">The draft is closed.</p>}
      {drafting && !trades && <p className="mt-2 text-sm text-muted">Trades are off for this league.</p>}
      {drafting && clockMine && !canDraft && (
        <p className="mt-2 text-sm text-muted">This pick belongs to {seat.name}. Your phone only drafts the seat that matches your name.</p>
      )}
      {drafting && !clockMine && clock && <p className="mt-2 text-sm text-muted">Waiting on {clock.name}. The draft snakes, so the last pick of a round goes first in the next.</p>}
      {drafting && myTurn && <p className="mt-2 text-sm font-semibold text-toka">You're on the clock.</p>}
      {drafting && <p className="mt-2 text-sm text-muted">Three picks each. A player can be drafted 4 times, and no two teams can match.</p>}
      {blocked && <p className="mt-2 text-sm font-semibold text-boot">{blocked}</p>}
      {seat.picks.length === 0 && <p className="mt-4 text-sm text-muted">No picks yet.</p>}
      <ol className="mt-4 flex flex-col gap-2">
        {seat.picks.map((pick, pickIndex) => {
          const player = contestantByName(pick);
          const out = Boolean(player && isBootPublic(player));
          const points = player ? (advanced ? advancedBonus(player) : bonus ? bonusOf(player) : 0) : 0;
          const idols = player ? idolCount(player) + advantageCount(player) : 0;
          const plays = player ? playCount(player) : 0;
          const wins = player ? winCount(player) : 0;
          const votes = player ? voteCount(player) : 0;
          const detail = [
            wins ? `${wins} ${wins === 1 ? "immunity" : "immunities"}` : "",
            idols ? `${idols} found` : "",
            plays ? `${plays} saved` : "",
            votes ? `${votes} ${votes === 1 ? "vote" : "votes"}` : "",
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
                  {(advanced || bonus) && player && points > 0 && (
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
                  const wantedPlayer = contestantByName(wanted);
                  if (wantedPlayer && isBootPublic(wantedPlayer)) {
                    setBlocked(`${wanted} is already out and can't be drafted.`);
                    return;
                  }
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
          <p className="mt-1 text-sm text-muted">Choose one player. Submit puts that one name on your team.</p>
          <ul className="mt-3 grid grid-cols-3 gap-2 pb-24">
            {contestants.filter((player) => !isBootPublic(player)).map((player) => {
              const mine = onTeam(player);
              const full = timesTaken(player) >= 4;
              const selected = choiceId === player.id;
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    disabled={mine || full}
                    aria-pressed={selected}
                    onClick={() => {
                      setBlocked("");
                      setChoiceId((current) => (current === player.id ? null : player.id));
                    }}
                    className={`w-full overflow-hidden rounded-xl bg-surface text-left disabled:opacity-40 ${selected ? "ring-2 ring-ember" : ""}`}
                  >
                    <img src={photoSrc(player.id)} alt="" width={160} height={214} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover" />
                    <span className="block px-2 py-2 text-sm font-semibold leading-tight">
                      {player.first}
                      {selected ? <span className="mt-0.5 block text-xs font-semibold text-ember">Your pick</span> : null}
                      {mine ? <span className="mt-0.5 block text-xs font-semibold text-muted">On your team</span> : null}
                      {!mine && full ? <span className="mt-0.5 block text-xs font-semibold text-muted">Drafted 4 times</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {drafting && myTurn && choiceId && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={() => {
              const player = contestants.find((item) => item.id === choiceId);
              if (!player) return;
              if (add(player)) setChoiceId(null);
            }}
            className="mx-auto block min-h-12 w-full max-w-5xl rounded-2xl bg-ember text-base font-semibold text-ember-ink"
          >
            Submit {contestants.find((item) => item.id === choiceId)?.first ?? "pick"} to your team
          </button>
        </div>
      )}
    </div>
  );
}
