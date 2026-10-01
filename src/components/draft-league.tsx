import { createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, ScrollText, Search, Trophy, UserRound, Users, X } from "lucide-react";
import { HistoryBoard, PastTeam, RulesBoard, SeasonPage } from "@/components/archive";
import { reportError, startDiagnostics } from "@/lib/diagnostics";
import { CreateLeague, CustomBoard, CustomTeam, LeagueHome } from "@/components/league-home";
import { loadCustomLeagues, newId, saveCustomLeagues, type CustomLeague } from "@/data/custom-leagues";
import {
  SEAT_KEY,
  contestantBlob,
  contestantById,
  contestants,
  displayName,
  isBootPublic,
  managerById,
  managers,
  nameList,
  ownersOf,
  photoSrc,
  pickIndex,
  type Contestant,
  type Manager,
} from "@/data/league";

type CastFilter = "all" | "savu" | "toka" | "in" | "out" | "mine";
type Tab = "league" | "cards" | "mine" | "past" | "rules";

const ClockContext = createContext(0);

function useNow(): number {
  return useContext(ClockContext);
}
type Place =
  | { view: "home" }
  | { view: "make" }
  | { view: "s51" }
  | { view: "custom"; id: string }
  | { view: "past"; id: string };
type Panel = { kind: "player"; id: string } | { kind: "manager"; id: string };

const FILTERS: { id: CastFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "savu", label: "Savu" },
  { id: "toka", label: "Toka" },
  { id: "in", label: "Still in" },
  { id: "out", label: "Out" },
  { id: "mine", label: "Yours" },
];

export function DraftLeague() {
  const [ready, setReady] = useState(false);
  const [seatId, setSeatId] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [place, setPlace] = useState<Place>({ view: "home" });
  const [leagues, setLeagues] = useState<CustomLeague[]>([]);
  const [tab, setTab] = useState<Tab>("league");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [pastTeam, setPastTeam] = useState<{ seasonId: string; name: string } | null>(null);
  const [customSeat, setCustomSeat] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CastFilter>("all");
  const [stack, setStack] = useState<Panel[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const saved = localStorage.getItem(SEAT_KEY);
    if (saved && managerById(saved)) setSeatId(saved);
    setLeagues(loadCustomLeagues());
    setReady(true);
    startDiagnostics();
  }, []);

  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportError(event.error ?? event.message);
    }
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  useEffect(() => {
    if (ready) saveCustomLeagues(leagues);
  }, [leagues, ready]);

  useEffect(() => {
    const next = contestants
      .map((c) => (c.revealAt ? Date.parse(c.revealAt) : Number.NaN))
      .filter((time) => time > now)
      .sort((a, b) => a - b)[0];
    if (next == null) return;
    const id = window.setTimeout(() => setNow(Date.now()), next - now + 250);
    return () => window.clearTimeout(id);
  }, [now]);

  const seat = seatId ? managerById(seatId) : null;
  const custom = place.view === "custom" ? leagues.find((l) => l.id === place.id) : undefined;
  const customPerson = custom && customSeat ? custom.seats.find((s) => s.id === customSeat) : undefined;

  function chooseSeat(id: string) {
    localStorage.setItem(SEAT_KEY, id);
    setSeatId(id);
    setChoosing(false);
    setPlace({ view: "s51" });
    setTab("league");
    setTeamId(id);
    setStack([]);
  }

  function openTeam(id: string) {
    setStack([]);
    setTab("league");
    setTeamId(id);
  }

  function selectTab(next: Tab) {
    setTab(next);
    setPastTeam(null);
    setStack([]);
    setTeamId(next === "mine" && seat ? seat.id : null);
  }

  function goBack() {
    if (place.view === "s51" && teamId) {
      setTeamId(null);
      setTab("league");
      return;
    }
    if (place.view === "s51" && pastTeam) {
      setPastTeam(null);
      return;
    }
    if (place.view === "custom" && customSeat) {
      setCustomSeat(null);
      return;
    }
    if (place.view === "past" && pastTeam) {
      setPastTeam(null);
      return;
    }
    setTeamId(null);
    setPastTeam(null);
    setCustomSeat(null);
    setPlace({ view: "home" });
  }

  function updateLeague(next: CustomLeague) {
    setLeagues((list) => list.map((league) => (league.id === next.id ? next : league)));
  }

  if (choosing) {
    return (
      <Gate
        onPick={chooseSeat}
        onCancel={() => {
          setChoosing(false);
          if (!seat) setPlace({ view: "home" });
        }}
      />
    );
  }

  const liveSeat = place.view === "s51" ? seat : null;
  const bare = place.view === "home" || place.view === "make";
  const showSearch = liveSeat && !teamId && (tab === "league" || tab === "cards");
  const showNav = Boolean(liveSeat);
  const panel = stack[stack.length - 1] ?? null;
  const backLabel =
    place.view === "s51" && teamId
      ? "Board"
      : place.view === "s51" && pastTeam
        ? "Standings"
        : place.view === "past" && pastTeam
          ? "Standings"
          : place.view === "custom" && customSeat
            ? "League"
            : "Leagues";

  return (
    <ClockContext.Provider value={now}>
    <div className="min-h-dvh bg-bg text-fg">
      {place.view !== "home" && place.view !== "make" && (
        <header className="safe-top sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-end justify-between gap-3 px-4 pt-3 pb-3">
            <div>
              <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted">
                <ChevronLeft className="size-4" />
                {backLabel}
              </button>
              {place.view === "s51" && <p className="text-xs font-semibold tracking-widest text-toka">IN PROGRESS</p>}
              {place.view === "s51" && (
                <h1 className="font-display text-5xl leading-none">
                  Survivor <span className="text-toka">51</span>
                </h1>
              )}
            </div>
            {seat && place.view === "s51" && (
              <div className="mb-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openTeam(seat.id)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold"
                  style={{ background: seat.bg, color: seat.fg }}
                >
                  {seat.name}
                </button>
                <button type="button" onClick={() => setChoosing(true)} className="text-sm font-semibold text-muted">
                  Switch
                </button>
              </div>
            )}
          </div>
          {showSearch && (
            <div className="mx-auto max-w-5xl px-4 pb-3">
              <label className="relative block">
                <span className="sr-only">{tab === "cards" ? "Search the cast" : "Search the league"}</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === "cards" ? "Search the cast" : "Search a seat or a pick"}
                  autoComplete="off"
                  className="w-full rounded-full bg-surface-2 py-2.5 pr-4 pl-10 text-base text-fg placeholder:text-muted"
                />
              </label>
              {tab === "cards" && (
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                  {FILTERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${chipClass(item.id, filter === item.id)}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>
      )}

      <main className={`mx-auto max-w-5xl px-4 pt-4 ${bare ? "safe-top" : ""} ${showNav ? "pb-28" : "pb-10"}`}>
        {place.view === "home" && (
          <LeagueHome
            leagues={leagues}
            onOpenLive={() => {
              setTeamId(null);
              setPastTeam(null);
              setTab("league");
              setPlace({ view: "s51" });
              if (!seat) setChoosing(true);
            }}
            onOpenCustom={(id) => {
              setCustomSeat(null);
              setPlace({ view: "custom", id });
            }}
            onCreate={() => setPlace({ view: "make" })}
            onOpenPast={(id) => {
              setPastTeam(null);
              setPlace({ view: "past", id });
            }}
          />
        )}
        {place.view === "make" && (
          <CreateLeague
            onCancel={() => setPlace({ view: "home" })}
            onCreate={(league) => {
              setLeagues((list) => [league, ...list]);
              setCustomSeat(null);
              setPlace({ view: "custom", id: league.id });
            }}
          />
        )}
        {place.view === "custom" && custom && !customPerson && (
          <CustomBoard
            league={custom}
            onOpenSeat={setCustomSeat}
            onAddSeat={(name) =>
              updateLeague({ ...custom, seats: [...custom.seats, { id: newId(), name, picks: [] }] })
            }
            onCloseDraft={() => updateLeague({ ...custom, drafting: false })}
            onDelete={() => {
              setLeagues((list) => list.filter((league) => league.id !== custom.id));
              setPlace({ view: "home" });
            }}
          />
        )}
        {customPerson && (
          <CustomTeam
            seat={customPerson}
            seats={custom?.seats ?? []}
            bonus={custom?.bonus === true}
            drafting={custom?.drafting !== false}
            trades={custom?.trades === true}
            onChange={(picks) => {
              if (!custom || !custom.drafting) return;
              updateLeague({
                ...custom,
                seats: custom.seats.map((s) => (s.id === customPerson.id ? { ...s, picks } : s)),
              });
            }}
            onTrade={(myIndex, otherId, theirIndex) => {
              if (!custom || !custom.drafting || !custom.trades) return;
              const mine = custom.seats.find((s) => s.id === customPerson.id);
              const other = custom.seats.find((s) => s.id === otherId);
              if (!mine || !other) return;
              const minePicks = [...mine.picks];
              const otherPicks = [...other.picks];
              const offered = minePicks[myIndex];
              const wanted = otherPicks[theirIndex];
              if (offered == null || wanted == null) return;
              minePicks[myIndex] = wanted;
              otherPicks[theirIndex] = offered;
              updateLeague({
                ...custom,
                seats: custom.seats.map((s) => {
                  if (s.id === mine.id) return { ...s, picks: minePicks };
                  if (s.id === other.id) return { ...s, picks: otherPicks };
                  return s;
                }),
              });
            }}
          />
        )}
        {place.view === "past" && !pastTeam && (
          <SeasonPage seasonId={place.id} seatName={seat?.name ?? ""} onOpenTeam={(name) => setPastTeam({ seasonId: place.id, name })} />
        )}
        {place.view === "past" && pastTeam && <PastTeam seasonId={pastTeam.seasonId} name={pastTeam.name} />}
        {liveSeat && teamId && (
          <Roster
            manager={managerById(teamId) ?? liveSeat}
            you={teamId === liveSeat.id}
            onOpenPlayer={(id) => setStack([{ kind: "player", id }])}
            onOpenManager={openTeam}
          />
        )}
        {liveSeat && !teamId && tab === "league" && (
          <LeagueBoard seat={liveSeat} query={query} onOpenManager={openTeam} onOpenPlayer={(id) => setStack([{ kind: "player", id }])} />
        )}
        {liveSeat && !teamId && tab === "cards" && (
          <CardBoard seat={liveSeat} query={query} filter={filter} onOpenPlayer={(id) => setStack([{ kind: "player", id }])} />
        )}
        {liveSeat && !teamId && tab === "past" && !pastTeam && (
          <HistoryBoard seatName={liveSeat.name} onOpenTeam={(seasonId, name) => setPastTeam({ seasonId, name })} />
        )}
        {liveSeat && !teamId && tab === "past" && pastTeam && <PastTeam seasonId={pastTeam.seasonId} name={pastTeam.name} />}
        {liveSeat && !teamId && tab === "rules" && <RulesBoard />}
      </main>

      {liveSeat && (
        <nav className="dock fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur">
          <div className="mx-auto grid max-w-5xl grid-cols-5">
            <TabButton icon={<Users className="size-5" />} label="League" active={tab === "league" && teamId !== liveSeat.id} onClick={() => selectTab("league")} />
            <TabButton icon={<LayoutGrid className="size-5" />} label="Cards" active={tab === "cards" && !teamId} onClick={() => selectTab("cards")} />
            <TabButton icon={<UserRound className="size-5" />} label="Mine" active={teamId === liveSeat.id} onClick={() => selectTab("mine")} />
            <TabButton icon={<Trophy className="size-5" />} label="Past" active={tab === "past" && !teamId} onClick={() => selectTab("past")} />
            <TabButton icon={<ScrollText className="size-5" />} label="Rules" active={tab === "rules" && !teamId} onClick={() => selectTab("rules")} />
          </div>
        </nav>
      )}

      {panel && seat && (
        <Sheet
          panel={panel}
          canBack={stack.length > 1}
          seat={seat}
          onClose={() => setStack([])}
          onBack={() => setStack((s) => s.slice(0, -1))}
          onOpenPlayer={(id) => setStack((s) => [...s, { kind: "player", id }])}
          onOpenManager={openTeam}
        />
      )}
    </div>
    </ClockContext.Provider>
  );
}

function Gate({ onPick, onCancel }: { onPick: (id: string) => void; onCancel?: () => void }) {
  return (
    <main className="safe-top mx-auto flex min-h-dvh max-w-3xl flex-col bg-bg px-4 pb-10 text-fg">
      <header className="pt-8">
        <p className="text-xs font-semibold tracking-widest text-muted">SURVIVOR 51 DRAFT</p>
        <h1 className="mt-2 font-display text-6xl leading-none">
          Who's <span className="text-toka">sitting</span>?
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Tap your name. It opens your team.
        </p>
        {onCancel && (
          <button type="button" onClick={onCancel} className="mt-3 text-sm font-semibold text-ember">
            Back to the board
          </button>
        )}
      </header>
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {managers.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onPick(m.id)}
              className="flex min-h-12 w-full items-center justify-center rounded-xl text-base font-semibold"
              style={{ background: m.bg, color: m.fg }}
            >
              {m.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

function bootRank(boot?: string): number {
  const match = boot?.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

function BootCallout({ onOpenPlayer }: { onOpenPlayer: (id: string) => void }) {
  const now = useNow();
  const latest = contestants
    .filter((c) => isBootPublic(c, now))
    .sort((a, b) => bootRank(b.boot) - bootRank(a.boot))[0];
  if (!latest) return null;
  const owners = ownersOf(latest.id);
  return (
    <div className="mb-4 rounded-2xl bg-boot/15 px-4 py-4">
      <button type="button" onClick={() => onOpenPlayer(latest.id)} className="text-left">
        <p className="font-display text-3xl leading-none text-boot">{latest.first} is out</p>
        <p className="mt-2 text-sm text-fg">
          {latest.boot}.{" "}
          {owners.length === 0
            ? `Nobody drafted ${latest.first}.`
            : `Drafted by ${nameList(owners.map((m) => m.name))}.`}
        </p>
        <p className="mt-3 text-sm font-semibold text-boot">Open {latest.first}'s card</p>
      </button>
    </div>
  );
}

function LeagueBoard({
  seat,
  query,
  onOpenManager,
  onOpenPlayer,
}: {
  seat: Manager;
  query: string;
  onOpenManager: (id: string) => void;
  onOpenPlayer: (id: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    return managers.filter((m) => {
      if (!q) return true;
      const picks = m.picks.map((id) => contestantById(id).first).join(" ");
      return `${m.name} ${picks}`.toLowerCase().includes(q);
    });
  }, [q]);

  return (
    <div>
      {!q && <BootCallout onOpenPlayer={onOpenPlayer} />}
      {!q && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className="text-sm font-semibold text-muted"
            onClick={() => {
              const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              document.getElementById(`seat-${seat.id}`)?.scrollIntoView({
                behavior: reduce ? "auto" : "smooth",
                block: "center",
              });
            }}
          >
            Jump to {seat.name}
          </button>
        </div>
      )}
      {rows.length === 0 && <p className="py-10 text-center text-sm text-muted">No seat matches that.</p>}
      <ul className="flex flex-col gap-2">
        {rows.map((m) => (
          <li
            key={m.id}
            id={`seat-${m.id}`}
            className={`rounded-2xl bg-surface p-3 ${m.id === seat.id ? "ring-2 ring-ember" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenManager(m.id)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold"
                style={{ background: m.bg, color: m.fg }}
              >
                {m.name}
                <ChevronRight className="size-4" />
              </button>
              {m.id === seat.id && <span className="text-xs font-semibold tracking-widest text-ember">YOU</span>}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {m.picks.map((id, index) => {
                const c = contestantById(id);
                return (
                  <button key={`${m.id}-${id}-${index}`} type="button" onClick={() => onOpenPlayer(id)} className="text-left">
                    <Face id={id} alt="" />
                    <span className="mt-1 block text-center text-xs text-muted">
                      {index + 1} · {c.first}
                    </span>
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardBoard({
  seat,
  query,
  filter,
  onOpenPlayer,
}: {
  seat: Manager;
  query: string;
  filter: CastFilter;
  onOpenPlayer: (id: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const now = useNow();
  const cards = contestants.filter((c) => {
    if (q && !contestantBlob(c).includes(q)) return false;
    if (filter === "savu" || filter === "toka") return c.tribe === filter;
    if (filter === "in") return !isBootPublic(c, now);
    if (filter === "out") return isBootPublic(c, now);
    if (filter === "mine") return pickIndex(seat, c.id) >= 0;
    return true;
  });

  return (
    <div>
      {cards.length === 0 && <p className="py-10 text-center text-sm text-muted">No cards match.</p>}
      <ul className="grid grid-cols-3 gap-px bg-line md:grid-cols-6">
        {cards.map((c) => {
          const owners = ownersOf(c.id);
          const mine = pickIndex(seat, c.id);
          return (
            <li key={c.id} className="bg-bg">
              <button
                type="button"
                onClick={() => onOpenPlayer(c.id)}
                className={`relative block w-full ${mine >= 0 ? "ring-2 ring-ember ring-inset" : ""}`}
                aria-label={`${displayName(c)}, ${c.tribe}${isBootPublic(c, now) ? ", voted out" : ""}, drafted by ${owners.length}`}
              >
                <Face id={c.id} alt="" />
                {mine >= 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-ember px-1.5 py-0.5 text-xs font-semibold text-ember-ink">
                    P{mine + 1}
                  </span>
                )}
                <span
                  className={`absolute top-1.5 right-1.5 rounded-full bg-bg/80 px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                    owners.length === 0 ? "text-toka" : owners.length >= 4 ? "text-ember" : "text-fg"
                  }`}
                >
                  {owners.length}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Roster({
  manager,
  you,
  onOpenPlayer,
  onOpenManager,
}: {
  manager: Manager;
  you?: boolean;
  onOpenPlayer: (id: string) => void;
  onOpenManager: (id: string) => void;
}) {
  const shares = new Map<string, string[]>();
  const now = useNow();
  for (const id of manager.picks) {
    for (const other of ownersOf(id)) {
      if (other.id === manager.id) continue;
      const list = shares.get(other.id) ?? [];
      list.push(contestantById(id).first);
      shares.set(other.id, list);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">{you ? "YOUR THREE" : "THREE PICKS"}</p>
      <h2 className="mt-1 font-display text-5xl leading-none">{manager.name}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {manager.picks.map((id, index) => {
          const c = contestantById(id);
          const others = ownersOf(id).filter((m) => m.id !== manager.id);
          return (
            <li key={`${manager.id}-${id}-${index}`}>
              <button
                type="button"
                onClick={() => onOpenPlayer(id)}
                className={`flex w-full gap-3 rounded-2xl p-3 text-left ${isBootPublic(c, now) ? "bg-boot/20" : "bg-surface"}`}
              >
                <div className="w-24 shrink-0">
                  <Face id={id} alt="" />
                </div>
                <div className="min-w-0 py-1">
                  <p className="text-xs font-semibold tracking-widest text-muted">PICK {index + 1}</p>
                  <p className="font-display text-4xl leading-none">{c.first}</p>
                  <p className="mt-1 text-sm text-fg">{c.job}</p>
                  <TribePill tribe={c.tribe} />
                  <p className="mt-2 text-sm text-muted">
                    {others.length === 0 ? "Only on this roster." : `Also with ${nameList(others.map((m) => m.name))}.`}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {shares.size > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold tracking-widest text-muted">SHARES A PICK WITH</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {[...shares.entries()].map(([id, names]) => {
              const m = managerById(id);
              if (!m) return null;
              return (
                <li key={id}>
                  <button type="button" onClick={() => onOpenManager(id)} className="flex w-full items-center justify-between gap-3 text-left">
                    <span className="rounded-lg px-2 py-1 font-semibold" style={{ background: m.bg, color: m.fg }}>
                      {m.name}
                    </span>
                    <span className="text-muted">{names.join(", ")}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Sheet({
  panel,
  canBack,
  seat,
  onClose,
  onBack,
  onOpenPlayer,
  onOpenManager,
}: {
  panel: Panel;
  canBack: boolean;
  seat: Manager;
  onClose: () => void;
  onBack: () => void;
  onOpenPlayer: (id: string) => void;
  onOpenManager: (id: string) => void;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close details" className="absolute inset-0 bg-bg/75" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="sheet-panel absolute inset-x-0 bottom-0 overflow-y-auto overscroll-contain rounded-t-3xl bg-surface px-4 pt-3 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
      >
        <div className="mb-3 flex items-center justify-between">
          {canBack ? (
            <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted">
              <ChevronLeft className="size-4" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-11 items-center justify-center rounded-full bg-surface-2">
            <X className="size-5" />
          </button>
        </div>
        {panel.kind === "player" ? (
          <PlayerBody id={panel.id} titleId={titleId} seat={seat} onOpenManager={onOpenManager} />
        ) : (
          <div>
            <ManagerBody id={panel.id} titleId={titleId} onOpenPlayer={onOpenPlayer} onOpenManager={onOpenManager} />
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerBody({
  id,
  titleId,
  seat,
  onOpenManager,
}: {
  id: string;
  titleId: string;
  seat: Manager;
  onOpenManager: (id: string) => void;
}) {
  const c = contestantById(id);
  const owners = ownersOf(id);
  const mine = pickIndex(seat, id);
  const now = useNow();
  const out = isBootPublic(c, now);

  return (
    <div>
      <div className="flex gap-4">
        <div className="w-28 shrink-0">
          <Face id={c.id} alt="" />
        </div>
        <div className="min-w-0">
          <TribePill tribe={c.tribe} />
          <h2 id={titleId} className="mt-2 font-display text-5xl leading-none">
            {c.first}
          </h2>
          <p className="mt-1 text-sm text-muted">{displayName(c)}</p>
          <p className="mt-2 text-sm">{c.job}</p>
          <p className="text-sm text-muted">
            {c.age} · {c.hometown}
          </p>
          {mine >= 0 && <p className="mt-2 text-sm font-semibold text-ember">Your pick {mine + 1}</p>}
        </div>
      </div>
      {out && (
        <p className="mt-4 rounded-xl bg-boot/15 px-3 py-2 text-sm text-boot">{c.boot ?? `${c.first} is out.`}</p>
      )}
      <h3 className="mt-5 text-xs font-semibold tracking-widest text-muted">
        {owners.length === 0 ? "UNDRAFTED" : `DRAFTED BY ${owners.length}`}
      </h3>
      {owners.length === 0 && !out && (
        <p className="mt-2 text-sm text-toka">Still in the game. Nobody at the table took {c.first}.</p>
      )}
      <ul className="mt-2 flex flex-col gap-2">
        {owners.map((m) => {
          const n = pickIndex(m, id);
          return (
            <li key={m.id}>
              <button type="button" onClick={() => onOpenManager(m.id)} className="flex w-full items-center justify-between gap-3 text-left">
                <span className="rounded-lg px-3 py-1.5 text-sm font-semibold" style={{ background: m.bg, color: m.fg }}>
                  {m.name}
                </span>
                <span className="text-sm text-muted">Pick {n + 1}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ManagerBody({
  id,
  titleId,
  onOpenPlayer,
  onOpenManager,
}: {
  id: string;
  titleId: string;
  onOpenPlayer: (id: string) => void;
  onOpenManager: (id: string) => void;
}) {
  const manager = managerById(id);
  if (!manager) return null;
  return (
    <div>
      <h2 id={titleId} className="sr-only">
        {manager.name}'s picks
      </h2>
      <Roster manager={manager} onOpenPlayer={onOpenPlayer} onOpenManager={onOpenManager} />
    </div>
  );
}

function Face({ id, alt }: { id: string; alt: string }) {
  const now = useNow();
  const out = isBootPublic(contestantById(id), now);
  return (
    <span className="relative block">
      <img
        src={photoSrc(id)}
        alt={alt}
        width={244}
        height={373}
        draggable={false}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full bg-surface-2"
      />
      {out && (
        <span className="pointer-events-none absolute inset-0 bg-boot/70" aria-hidden>
          <span className="absolute inset-x-0 bottom-1.5 text-center font-display text-2xl leading-none tracking-widest text-boot-ink">
            OUT
          </span>
        </span>
      )}
    </span>
  );
}

function TribePill({ tribe }: { tribe: Contestant["tribe"] }) {
  const savu = tribe === "savu";
  return (
    <span
      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-widest ${
        savu ? "bg-savu text-savu-ink" : "bg-toka text-toka-ink"
      }`}
    >
      {savu ? "SAVU" : "TOKA"}
    </span>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${active ? "text-ember" : "text-muted"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function chipClass(id: CastFilter, on: boolean): string {
  if (!on) return "bg-surface-2 text-fg";
  if (id === "savu") return "bg-savu text-savu-ink";
  if (id === "toka") return "bg-toka text-toka-ink";
  if (id === "out" || id === "mine") return "bg-ember text-ember-ink";
  return "bg-fg text-bg";
}
