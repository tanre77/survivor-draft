import { useState } from "react";
import type { CustomLeague } from "@/data/custom-leagues";
import { loadProfile, profileLines, saveProfile } from "@/data/profile";

export function ProfileBoard({ leagues, onName }: { leagues: CustomLeague[]; onName: (name: string) => void }) {
  const [name, setName] = useState(() => loadProfile().name);
  const [draft, setDraft] = useState(name);
  const lines = profileLines(name, leagues);

  function save(next: string) {
    const trimmed = next.trim();
    saveProfile({ name: trimmed });
    setName(trimmed);
    setDraft(trimmed);
    onName(trimmed);
  }

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-muted">YOUR NAME</p>
      <h1 className="mt-1 font-display text-5xl leading-none">{name || "Profile"}</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        One name follows you through every league. Past seasons, Survivor 51, and leagues you join all show up here.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          save(draft);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What the league calls you"
          autoComplete="name"
          className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-3 text-base"
        />
        <button type="submit" className="min-h-12 rounded-xl bg-ember px-4 text-base font-semibold text-ember-ink">
          Save
        </button>
      </form>

      {name && lines.length === 0 && (
        <p className="mt-6 text-sm text-muted">No league has {name} yet. Join one with a code, or start a league and you’ll be in it.</p>
      )}
      {lines.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2">
          {lines.map((line) => (
            <li key={line.id} className="rounded-2xl bg-surface px-4 py-3">
              <span className="block text-xs font-semibold tracking-widest text-toka">
                {line.place === 1 ? "WON" : line.place != null ? `#${line.place}` : "IN PROGRESS"}
              </span>
              <span className="mt-1 block font-display text-3xl leading-none">{line.where}</span>
              <span className="mt-1 block text-sm text-muted">
                {line.total ? `${line.total} points` : line.detail}
                {line.total && line.detail ? ` · ${line.detail}` : ""}
                {line.prize ? ` · ${line.prize}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
