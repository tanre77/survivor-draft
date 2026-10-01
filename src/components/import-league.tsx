import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { parseCsv, parseWorkbook, type ImportedSheet } from "@/data/import-sheet";

type Found = ImportedSheet & { key: string };

export function ImportLeague({ onCancel, onImport }: { onCancel: () => void; onImport: (sheets: ImportedSheet[]) => void }) {
  const [found, setFound] = useState<Found[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState("");

  function take(sheets: ImportedSheet[]) {
    if (!sheets.length) {
      setFound([]);
      setError("No league in that file. It needs a Name column and a Pick 1 column, like the family sheet.");
      return;
    }
    const next = sheets.map((sheet, index) => ({ ...sheet, key: `${sheet.name}-${index}` }));
    const fullest = new Map<string, string>();
    for (const sheet of next) {
      const current = next.find((item) => item.key === fullest.get(sheet.name));
      if (!current || sheet.seats.length > current.seats.length) fullest.set(sheet.name, sheet.key);
    }
    const marks: Record<string, boolean> = {};
    for (const sheet of next) {
      const already = sheet.season != null && sheet.season >= 46 && sheet.season <= 50;
      marks[sheet.key] = !already && fullest.get(sheet.name) === sheet.key;
    }
    setFound(next);
    setPicked(marks);
    setError("");
  }

  async function fromFile(file: File) {
    setBusy(true);
    setError("");
    try {
      if (/\.csv$|\.txt$/i.test(file.name) || file.type.includes("csv") || file.type.startsWith("text/")) {
        take([parseCsv(await file.text(), file.name.replace(/\.(csv|txt)$/i, ""))].filter((sheet): sheet is ImportedSheet => sheet != null));
      } else {
        take(await parseWorkbook(await file.arrayBuffer(), file.name.replace(/\.xlsx$/i, "")));
      }
    } catch {
      setError("That file didn’t open. Use the family workbook, an .xlsx, or a CSV.");
    } finally {
      setBusy(false);
    }
  }

  async function fromFamily() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/family-draft.xlsx");
      if (!response.ok) throw new Error("missing");
      take(await parseWorkbook(await response.arrayBuffer(), "Family sheet"));
    } catch {
      setError("The family sheet didn’t load. Upload the workbook instead.");
    } finally {
      setBusy(false);
    }
  }

  const selected = found.filter((sheet) => picked[sheet.key]);

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted">
        <ChevronLeft className="size-4" />
        Leagues
      </button>
      <p className="mt-3 text-xs font-semibold tracking-widest text-toka">FROM A SPREADSHEET</p>
      <h1 className="mt-1 font-display text-5xl leading-none">Import a league</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Same shape as the family workbook: Name, Pick 1, Pick 2, and the rest. If the sheet has points and a total, those come in too. A scored sheet lands closed.
      </p>

      <label className="mt-5 flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-ember px-4 text-base font-semibold text-ember-ink">
        {busy ? "Reading…" : "Choose a file"}
        <input
          type="file"
          accept=".xlsx,.csv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void fromFile(file);
            event.target.value = "";
          }}
        />
      </label>
      <button type="button" onClick={() => void fromFamily()} className="mt-3 min-h-11 w-full text-sm font-semibold text-toka">
        Use the family sheet
      </button>

      <label className="mt-6 block text-sm font-semibold">
        Or paste a table
        <textarea
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          rows={4}
          placeholder={"Name, Pick 1, Pick 2, Pick 3\nTanner, Rob, Maggie, Kilby"}
          className="mt-1 w-full rounded-xl bg-surface-2 px-3 py-3 text-base font-normal"
        />
      </label>
      <button
        type="button"
        onClick={() => {
          const sheet = parseCsv(paste);
          take(sheet ? [sheet] : []);
        }}
        className="mt-2 text-sm font-semibold text-muted"
      >
        Read the paste
      </button>

      {error && <p className="mt-4 text-sm text-boot">{error}</p>}

      {found.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2">
          {found.map((sheet) => (
            <li key={sheet.key}>
              <button
                type="button"
                onClick={() => setPicked((current) => ({ ...current, [sheet.key]: !current[sheet.key] }))}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
                aria-pressed={picked[sheet.key] === true}
              >
                <span>
                  <span className="block text-base font-semibold">
                    {sheet.name}
                    {sheet.source && sheet.source !== sheet.name ? <span className="text-muted"> · {sheet.source}</span> : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {sheet.seats.length} {sheet.seats.length === 1 ? "person" : "people"}
                    {sheet.scored ? " · scores included" : " · picks only"}
                    {sheet.season != null && sheet.season >= 46 && sheet.season <= 50 ? " · already in Past" : ""}
                  </span>
                </span>
                <span className={`text-sm font-semibold ${picked[sheet.key] ? "text-toka" : "text-muted"}`}>
                  {picked[sheet.key] ? "Import" : "Skip"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <button type="button" onClick={() => onImport(selected)} className="mt-5 min-h-12 w-full rounded-2xl bg-fg text-base font-semibold text-bg">
          Import {selected.length === 1 ? selected[0].name : `${selected.length} leagues`}
        </button>
      )}
    </div>
  );
}
