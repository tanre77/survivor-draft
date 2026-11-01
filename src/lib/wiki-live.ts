import { createServerFn } from "@tanstack/react-start";
import { contestants } from "@/data/league";
import { parseWikiBoots, type WikiBoot } from "@/lib/wiki-board";

const WIKI = "https://survivor.fandom.com/api.php?action=parse&page=Survivor_51&prop=wikitext&format=json";
const FRESH = 10 * 60 * 1000;

let cache: { at: number; boots: WikiBoot[] } | null = null;

export const fetchWikiBoots = createServerFn({ method: "POST" }).handler(async () => {
  const now = Date.now();
  if (cache && now - cache.at < FRESH) return cache.boots;
  try {
    const response = await fetch(`${WIKI}&origin=*`, {
      headers: { accept: "application/json", "user-agent": "SurvivorFantasyDraft/1.0 (family scoreboard)" },
    });
    if (!response.ok) return cache?.boots ?? [];
    const body = (await response.json()) as { parse?: { wikitext?: { "*"?: string } | string } };
    const wikitext = body.parse?.wikitext;
    const text = typeof wikitext === "string" ? wikitext : wikitext?.["*"] ?? "";
    if (!text) return cache?.boots ?? [];
    const boots = parseWikiBoots(text, contestants, now);
    cache = { at: now, boots };
    return boots;
  } catch {
    return cache?.boots ?? [];
  }
});
