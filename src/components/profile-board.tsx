import { useState } from "react";
import type { CustomLeague } from "@/data/custom-leagues";
import { loadProfile, normalizeEmail, saveProfile } from "@/data/profile";
import { profileLines } from "@/data/profile-lines";
import { loadTheme, saveTheme, type ThemeChoice } from "@/data/theme";

const APPEARANCE: { id: ThemeChoice; label: string }[] = [
  { id: "system", label: "System" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export function ProfileBoard({ leagues, onName }: { leagues: CustomLeague[]; onName: (name: string) => void }) {
  const [name, setName] = useState(() => loadProfile().name);
  const [draft, setDraft] = useState(name);
  const [email, setEmail] = useState(() => loadProfile().email);
  const [emailDraft, setEmailDraft] = useState(email);
  const [theme, setTheme] = useState<ThemeChoice>(() => loadTheme());
  const lines = profileLines(name, leagues);

  function save(next: string) {
    const trimmed = next.trim();
    const savedEmail = normalizeEmail(emailDraft);
    saveProfile({ name: trimmed, email: emailDraft });
    setName(trimmed);
    setDraft(trimmed);
    setEmail(savedEmail);
    setEmailDraft(savedEmail);
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
      <label className="mt-4 block text-sm font-semibold">
        Email for turn alerts
        <input
          value={emailDraft}
          onChange={(event) => setEmailDraft(event.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          inputMode="email"
          className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
        />
      </label>
      <p className="mt-2 text-sm text-muted">
        {email ? `Turn alerts go to ${email}.` : "Add an email and we'll mail you when it's your pick."}
      </p>

      <p className="mt-8 text-xs font-semibold tracking-widest text-muted">APPEARANCE</p>
      <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Appearance">
        {APPEARANCE.map((choice) => (
          <button
            key={choice.id}
            type="button"
            aria-pressed={theme === choice.id}
            onClick={() => {
              saveTheme(choice.id);
              setTheme(choice.id);
            }}
            className={`min-h-12 rounded-xl text-sm font-semibold ${theme === choice.id ? "bg-toka text-toka-ink" : "bg-surface text-fg"}`}
          >
            {choice.label}
          </button>
        ))}
      </div>

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
