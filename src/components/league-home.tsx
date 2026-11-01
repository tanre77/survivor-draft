import { useState, type FormEvent } from "react";
import { eraseCustomLeagues, leagueStillOpen, nextDrafter, type CustomLeague } from "@/data/custom-leagues";
import { eraseProfile } from "@/data/profile";
import { SEAT_KEY } from "@/data/league";
import { sameName } from "@/lib/turn-alert";

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
  const [board, setBoard] = useState<"open" | "done">("open");

  function eraseDevice() {
    eraseCustomLeagues();
    eraseProfile();
    localStorage.removeItem(SEAT_KEY);
    window.location.reload();
  }

  async function join(event: FormEvent) {
    event.preventDefault();
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
        Leagues you start stay under In progress until the draft is finished.
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

      <div className="mt-6 flex gap-2" role="tablist" aria-label="Leagues">
        {(
          [
            ["open", "In progress"],
            ["done", "Finished"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={board === id}
            onClick={() => setBoard(id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${board === id ? "bg-toka text-toka-ink" : "bg-surface text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {board === "open" ? (
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <button type="button" onClick={onOpenLive} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
              <span className="text-xs font-semibold tracking-widest text-toka">IN PROGRESS</span>
              <span className="mt-1 block font-display text-4xl leading-none">Survivor 51</span>
              <span className="mt-1 block text-sm text-muted">23 seats · Fiji</span>
            </button>
          </li>
          {leagues.filter((league) => leagueStillOpen(league)).map((league) => {
            const clock = nextDrafter(league.seats);
            const yours = Boolean(clock && sameName(clock.name, profileName));
            return (
              <li key={league.id}>
                <button type="button" onClick={() => onOpenCustom(league.id)} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
                  <span className={`text-xs font-semibold tracking-widest ${yours ? "text-ember" : "text-toka"}`}>
                    {yours ? "YOUR TURN" : "IN PROGRESS"}
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
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {leagues.filter((league) => !leagueStillOpen(league)).length === 0 && (
            <li className="text-sm text-muted">Finished seasons and closed drafts show up here.</li>
          )}
          {leagues.filter((league) => !leagueStillOpen(league)).map((league) => (
            <li key={league.id}>
              <button type="button" onClick={() => onOpenCustom(league.id)} className="w-full rounded-2xl bg-surface px-4 py-4 text-left">
                <span className="text-xs font-semibold tracking-widest text-toka">FINISHED</span>
                <span className="mt-1 block font-display text-4xl leading-none">{league.name}</span>
                <span className="mt-1 block text-sm text-muted">{league.seats.length} {league.seats.length === 1 ? "person" : "people"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

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
        <div className="mt-4 border-t border-line pt-4">
          {!erasing ? (
            <button type="button" onClick={() => setErasing(true)} className="text-sm font-semibold text-muted">
              Erase this device
            </button>
          ) : (
            <button type="button" onClick={eraseDevice} className="text-sm font-semibold text-ember">
              Erase the saved seat and leagues
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

