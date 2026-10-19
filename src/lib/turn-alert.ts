const SEEN_KEY = "turn-pings";

export function sameName(a: string, b: string): boolean {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  return left !== "" && left === right;
}

export function alertsGranted(): boolean {
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

/** Must run from a tap. Browsers ignore a permission ask that is not a gesture. */
export async function armTurnAlerts(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export function pingTurn(leagueName: string, body: string) {
  if (!alertsGranted()) return;
  try {
    new Notification(`Your turn · ${leagueName}`, { body, tag: `turn-${leagueName}` });
  } catch {
    /* The in-app banner still shows when the browser blocks a background alert. */
  }
}

export function alreadyPinged(key: string): boolean {
  try {
    return (sessionStorage.getItem(SEEN_KEY) ?? "").split("\n").includes(key);
  } catch {
    return false;
  }
}

export function markPinged(key: string) {
  try {
    const list = (sessionStorage.getItem(SEEN_KEY) ?? "").split("\n").filter(Boolean);
    if (!list.includes(key)) list.push(key);
    sessionStorage.setItem(SEEN_KEY, list.slice(-40).join("\n"));
  } catch {
    /* a private window can refuse storage; the banner still shows */
  }
}
