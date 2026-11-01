export function inviteUrl(origin: string, code: string, name?: string): string {
  const url = new URL(origin.replace(/\/$/, "") + "/");
  url.searchParams.set("join", code.trim().toUpperCase());
  const who = name?.trim();
  if (who) url.searchParams.set("name", who);
  return url.toString();
}
