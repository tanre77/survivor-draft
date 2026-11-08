import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("..", import.meta.url));

function collectSwift(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSwift(full));
    else if (entry.name.endsWith(".swift")) out.push(relative(repo, full));
  }
  return out;
}

const swiftFiles = collectSwift(join(repo, "ios"));

const banned = [
  "NSCameraUsageDescription",
  "NSMicrophoneUsageDescription",
  "NSLocationWhenInUseUsageDescription",
  "NSContactsUsageDescription",
  "StoreKit",
  "WKWebView",
  "google-services.json",
  "GoogleService-Info.plist",
  "AIza",
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const required of [
  "Scoring.swift",
  "Airtime.swift",
  "Theme.swift",
  "Chrome.swift",
  "Palette.swift",
  "BoardData.swift",
  "SurvivorDraftApp.swift",
  "ScoringTests.swift",
  "AirtimeTests.swift",
]) {
  if (!swiftFiles.some((file) => file.endsWith(required))) fail(`missing ${required}`);
}

for (const file of swiftFiles) {
  const source = readFileSync(join(repo, file), "utf8");
  const open = (source.match(/\{/g) ?? []).length;
  const close = (source.match(/\}/g) ?? []).length;
  if (open !== close) fail(`${file} has ${open} '{' and ${close} '}'`);
  if (!source.includes("struct") && !source.includes("enum") && !source.includes("final class")) {
    fail(`${file} has no type`);
  }
  for (const word of banned) {
    if (source.includes(word) && word !== "GoogleService-Info.plist" && word !== "google-services.json") {
      fail(`${file} mentions ${word}`);
    }
  }
  if (!file.includes("/Generated/")) {
    if (source.includes("Color(red:")) fail(`${file} hardcodes Color(red:). Use Palette.`);
    if (/#[0-9A-Fa-f]{6}/.test(source)) fail(`${file} hardcodes a hex color. Use Palette.`);
  }
}

const css = readFileSync(join(repo, "src/styles.css"), "utf8");
const palette = readFileSync(join(repo, "ios/SurvivorDraft/Generated/Palette.swift"), "utf8");

function blockHexes(pattern, label) {
  const match = css.match(pattern);
  if (!match) fail(`styles.css is missing ${label}`);
  return [...match[1].matchAll(/--color-[a-z0-9-]+\s*:\s*(#[0-9a-fA-F]{6})/g)].map((item) => item[1].toLowerCase());
}

const darkHexes = blockHexes(/@theme\s*\{([^}]*)\}/, "the @theme palette");
const lightHexes = blockHexes(/html\[data-theme="light"\]\s*\{([^}]*)\}/, "the light theme");
if (!darkHexes.includes("#e10600")) fail("dark boot token is not #e10600");
if (!lightHexes.includes("#b10500")) fail("light boot token is not #b10500");
for (const hex of [...darkHexes, ...lightHexes]) {
  if (!palette.toLowerCase().includes(`"${hex}"`)) fail(`Palette.swift missing ${hex} from styles.css`);
}

const board = readFileSync(join(repo, "ios/SurvivorDraft/Generated/BoardData.swift"), "utf8");
const contestants = (board.match(/Contestant\(/g) ?? []).length;
const managers = (board.match(/Manager\(/g) ?? []).length;
if (contestants !== 21) fail(`expected 21 contestants, got ${contestants}`);
if (managers !== 23) fail(`expected 23 managers, got ${managers}`);
if (!board.includes('boot: "5th voted out · Day 10"')) fail("Alexis boot missing from BoardData");
if (!board.includes('boot: "6th voted out · Day 10"')) fail("Linnea boot missing from BoardData");
if (!board.includes('id: "ori"') || !board.includes('boot: "7th voted out · Day 12"')) fail("Ori boot missing from BoardData");
if (!board.includes('revealAt: "2026-10-29T01:30:00.000Z"')) fail("Ori reveal is not 9:30pm Eastern");

const info = readFileSync(join(repo, "ios/SurvivorDraft/Info.plist"), "utf8");
for (const word of ["NSCameraUsageDescription", "NSLocationWhenInUseUsageDescription", "NSContactsUsageDescription"]) {
  if (info.includes(word)) fail(`Info.plist asks for ${word}`);
}
if (!info.includes("ITSAppUsesNonExemptEncryption")) fail("Info.plist missing encryption exemption");

const manifest = readFileSync(join(repo, "android/android/app/src/main/AndroidManifest.xml"), "utf8");
for (const word of ["CAMERA", "RECORD_AUDIO", "ACCESS_FINE_LOCATION", "READ_CONTACTS", "com.android.vending.BILLING"]) {
  if (manifest.includes(word)) fail(`AndroidManifest requests ${word}`);
}

const gradle = readFileSync(join(repo, "android/android/app/build.gradle"), "utf8");
const applied = (id) =>
  gradle.split("\n").some((line) => {
    const trimmed = line.trim();
    return !trimmed.startsWith("//") && trimmed.includes(id);
  });
if (applied("com.google.firebase.crashlytics")) fail("Crashlytics plugin must stay off until a config file exists");
if (applied("com.google.gms.google-services")) fail("Google services plugin is enabled without a config file");

const androidPalette = ["#100e0c", "#1b1714", "#f4efe6", "#a89886", "#6e4aa8", "#e2b340", "#e25b2a", "#e10600"];
const colorsXml = readFileSync(join(repo, "android/android/app/src/main/res/values/colors.xml"), "utf8").toLowerCase();
const reactNative = readFileSync(join(repo, "android/App.tsx"), "utf8").toLowerCase();
for (const hex of androidPalette) {
  if (!colorsXml.includes(hex)) fail(`android colors.xml is missing ${hex}`);
  if (!reactNative.includes(hex)) fail(`android/App.tsx is missing ${hex}`);
}
if (reactNative.includes("#b7aea2")) fail("React Native muted color drifted from #a89886");

const sharedBoard = JSON.parse(readFileSync(join(repo, "shared/board.json"), "utf8"));
const assetBoard = JSON.parse(readFileSync(join(repo, "android/android/app/src/main/assets/board.json"), "utf8"));
const sharedOri = sharedBoard.contestants.find((row) => row.id === "ori");
const assetOri = assetBoard.contestants.find((row) => row.id === "ori");
if (!sharedOri || !assetOri || sharedOri.revealAt !== assetOri.revealAt || sharedOri.boot !== assetOri.boot) {
  fail("android assets/board.json is not the latest shared board");
}
if (assetBoard.contestants.length !== 21) fail("android assets/board.json contestant count drifted");

const timing = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--test", "src/data/airtime.test.ts", "src/lib/wiki-board.test.ts"],
  { stdio: "inherit", cwd: repo },
);
if (timing.status !== 0) fail("boot timing tests failed");

const rn = spawnSync("npx", ["tsc", "--noEmit", "-p", "android/tsconfig.json"], { stdio: "inherit", cwd: repo });
if (rn.status !== 0) fail("React Native typecheck failed");

console.log("swift structure ok, palette matches styles.css, android permissions ok, react native typecheck passed");
