const KEY = "draft-blocked-names";

export function isBlocked(name: string, blocked: string[]): boolean {
  const key = name.trim().toLowerCase();
  return key !== "" && blocked.some((item) => item.trim().toLowerCase() === key);
}

export function loadBlocks(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((name): name is string => typeof name === "string" && name.trim() !== "").slice(0, 80);
  } catch {
    return [];
  }
}

export function blockName(name: string): string[] {
  const next = name.trim().slice(0, 40);
  const blocked = loadBlocks();
  if (!next || isBlocked(next, blocked)) return blocked;
  const saved = [...blocked, next];
  localStorage.setItem(KEY, JSON.stringify(saved));
  return saved;
}

export function unblockName(name: string): string[] {
  const saved = loadBlocks().filter((item) => item.trim().toLowerCase() !== name.trim().toLowerCase());
  localStorage.setItem(KEY, JSON.stringify(saved));
  return saved;
}
