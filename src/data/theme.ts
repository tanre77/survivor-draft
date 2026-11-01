export type ThemeChoice = "system" | "dark" | "light";

const KEY = "s51-theme";

export function themeName(choice: ThemeChoice, prefersDark: boolean): "dark" | "light" {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  return prefersDark ? "dark" : "light";
}

export function loadTheme(): ThemeChoice {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* keep the device setting */
  }
  return "system";
}

export function applyTheme(choice: ThemeChoice = loadTheme()) {
  const dark = themeName(choice, window.matchMedia("(prefers-color-scheme: dark)").matches) === "dark";
  const theme = dark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#100e0c" : "#f4efe6");
}

export function saveTheme(choice: ThemeChoice) {
  localStorage.setItem(KEY, choice);
  applyTheme(choice);
}

export function watchTheme(): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (loadTheme() === "system") applyTheme("system");
  };
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
