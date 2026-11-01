import { useEffect, useRef, useState } from "react";
import { blockName, isBlocked, loadBlocks } from "@/data/blocks";
import { listLeagueMessages, postLeagueMessage, type LeagueMessage } from "@/lib/league-chat";
import { reportLeagueMessage } from "@/lib/support";

const REASONS = ["Harassment", "Hate", "Spam", "Other"] as const;

export function LeagueChat({ code, you }: { code?: string; you: string }) {
  const [messages, setMessages] = useState<LeagueMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(() => loadBlocks());
  const [reporting, setReporting] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function load(invite: string) {
    void listLeagueMessages({ data: invite })
      .then((rows) => {
        setMessages(rows);
        setError("");
      })
      .catch(() => setError("Couldn't load the chat."));
  }

  useEffect(() => {
    if (!code) return;
    load(code);
  }, [code]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function send() {
    const body = draft.trim();
    if (!code || !body || sending) return;
    if (!you.trim()) {
      setError("Save your name on the You tab first.");
      return;
    }
    setSending(true);
    void postLeagueMessage({ data: { code, author: you.trim(), body } })
      .then((message) => {
        setMessages((list) => [...list, message]);
        setDraft("");
        setError("");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn't send that."))
      .finally(() => setSending(false));
  }

  function report(message: LeagueMessage, reason: (typeof REASONS)[number]) {
    if (!code) return;
    if (!you.trim()) {
      setError("Save your name on the You tab first.");
      return;
    }
    void reportLeagueMessage({
      data: {
        code,
        messageId: message.id,
        author: message.author,
        reporter: you.trim(),
        reason,
        excerpt: message.body,
      },
    })
      .then(() => {
        setReporting(null);
        setError("");
        setSent("Reported. Support will review it.");
      })
      .catch(() => setError("Couldn't send that report."));
  }

  if (!code) {
    return (
      <section className="mt-6 rounded-2xl bg-surface p-4">
        <p className="text-xs font-semibold tracking-widest text-toka">TABLE TALK</p>
        <p className="mt-1 text-sm text-muted">Make an invite code so the league can trash talk. The chat stays with the code.</p>
      </section>
    );
  }

  const visible = messages.filter((message) => !isBlocked(message.author, blocked));

  return (
    <section className="mt-6 rounded-2xl bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-widest text-toka">TABLE TALK</p>
        <button type="button" onClick={() => load(code)} className="text-sm font-semibold text-muted">
          Refresh
        </button>
      </div>
      <div ref={listRef} className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto">
        {visible.length === 0 && <p className="text-sm text-muted">Nobody has talked yet.</p>}
        {visible.map((message) => {
          const mine = message.author.trim().toLowerCase() === you.trim().toLowerCase();
          return (
            <div key={message.id} className="text-sm">
              <span className="font-semibold">{message.author}</span>
              <span className="mt-0.5 block">{message.body}</span>
              {!mine && (
                <span className="mt-1 flex gap-3">
                  <button type="button" onClick={() => setReporting(reporting === message.id ? null : message.id)} className="font-semibold text-muted">
                    Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlocked(blockName(message.author))}
                    className="font-semibold text-muted"
                  >
                    Block
                  </button>
                </span>
              )}
              {reporting === message.id && (
                <span className="mt-2 flex flex-wrap gap-2">
                  {REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => report(message, reason)}
                      className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold"
                    >
                      {reason}
                    </button>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-boot">{error}</p>}
      {sent && <p className="mt-2 text-sm text-muted">{sent}</p>}
      <p className="mt-2 text-xs text-muted">Report or block a message. Unblock people on the You tab.</p>
      <label className="mt-3 block text-sm font-semibold">
        {you.trim() ? `Talk as ${you.trim()}` : "Save your name on the You tab"}
        <span className="mt-1 flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                send();
              }
            }}
            maxLength={280}
            disabled={!you.trim()}
            className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={send}
            disabled={!you.trim() || sending || !draft.trim()}
            className="min-h-12 rounded-xl bg-ember px-4 text-base font-semibold text-ember-ink disabled:opacity-40"
          >
            Send
          </button>
        </span>
      </label>
    </section>
  );
}
