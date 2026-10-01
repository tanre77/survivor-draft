import { useState } from "react";
import { loadBlocks, unblockName } from "@/data/blocks";
import { sendSupportRequest } from "@/lib/support";

export function SupportBoard({ you }: { you: string }) {
  const [blocked, setBlocked] = useState(() => loadBlocks());
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  function send() {
    const body = note.trim();
    if (!you.trim()) {
      setStatus("Save your name above first.");
      return;
    }
    if (body.length < 4 || sending) return;
    setSending(true);
    void sendSupportRequest({ data: { name: you.trim(), body } })
      .then(() => {
        setNote("");
        setStatus("Sent. Support reads these.");
      })
      .catch(() => setStatus("Couldn't send that. Use the contact link instead."))
      .finally(() => setSending(false));
  }

  return (
    <section className="mt-8 rounded-2xl bg-surface p-4">
      <p className="text-xs font-semibold tracking-widest text-toka">SUPPORT</p>
      <h2 className="mt-1 font-display text-4xl leading-none">Need a hand</h2>
      <p className="mt-2 text-sm text-muted">
        Buy-ins stay outside the app. Report or block someone from their chat message. Unblock them here.
      </p>
      <p className="mt-3 text-sm">
        Contact{" "}
        <a href="https://github.com/tanre77" className="font-semibold text-toka">
          github.com/tanre77
        </a>
        . The public page is{" "}
        <a href="/support.html" className="font-semibold text-toka">
          Support
        </a>
        .
      </p>
      {blocked.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {blocked.map((name) => (
            <li key={name} className="flex items-center justify-between gap-3 text-sm">
              <span>
                Blocked <span className="font-semibold">{name}</span>
              </span>
              <button
                type="button"
                onClick={() => setBlocked(unblockName(name))}
                className="font-semibold text-muted"
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="mt-4 block text-sm font-semibold">
        Write support
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1000}
          rows={3}
          className="mt-1 w-full resize-none rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
        />
      </label>
      <button
        type="button"
        onClick={send}
        disabled={sending || note.trim().length < 4}
        className="mt-2 min-h-12 w-full rounded-xl bg-ember text-base font-semibold text-ember-ink disabled:opacity-40"
      >
        Send
      </button>
      {status && <p className="mt-2 text-sm text-muted">{status}</p>}
    </section>
  );
}
