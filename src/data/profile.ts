const KEY = "draft-profile";

export type Profile = { name: string; email: string };

export type ProfileLine = {
  id: string;
  where: string;
  detail: string;
  place?: number;
  total?: string;
  prize?: string;
};

export function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase().slice(0, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as { name?: unknown; email?: unknown }) : null;
    const name = parsed && typeof parsed.name === "string" ? parsed.name.trim().slice(0, 40) : "";
    const email = parsed && typeof parsed.email === "string" ? normalizeEmail(parsed.email) : "";
    return { name, email };
  } catch {
    /* a bad save just means no name yet */
  }
  return { name: "", email: "" };
}

export function saveProfile(profile: { name?: string; email?: string }) {
  const current = loadProfile();
  const next = {
    name: profile.name !== undefined ? profile.name.trim().slice(0, 40) : current.name,
    email: profile.email !== undefined ? normalizeEmail(profile.email) : current.email,
  };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function eraseProfile() {
  localStorage.removeItem(KEY);
}
