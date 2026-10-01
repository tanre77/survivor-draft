const KEY = "draft-profile";

export type Profile = { name: string };

export type ProfileLine = {
  id: string;
  where: string;
  detail: string;
  place?: number;
  total?: string;
  prize?: string;
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as { name?: unknown }) : null;
    if (parsed && typeof parsed.name === "string") return { name: parsed.name.trim().slice(0, 40) };
  } catch {
    /* a bad save just means no name yet */
  }
  return { name: "" };
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(KEY, JSON.stringify({ name: profile.name.trim().slice(0, 40) }));
}

export function eraseProfile() {
  localStorage.removeItem(KEY);
}

