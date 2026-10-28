import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const swiftFiles = [
  "ios/SurvivorDraft/Scoring.swift",
  "ios/SurvivorDraft/CrashReporting.swift",
  "ios/SurvivorDraft/SurvivorDraftApp.swift",
  "ios/SurvivorDraft/Generated/BoardData.swift",
  "ios/SurvivorDraftTests/ScoringTests.swift",
];

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

for (const file of swiftFiles) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
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
}

const board = readFileSync(new URL("../ios/SurvivorDraft/Generated/BoardData.swift", import.meta.url), "utf8");
const contestants = (board.match(/Contestant\(/g) ?? []).length;
const managers = (board.match(/Manager\(/g) ?? []).length;
if (contestants !== 21) fail(`expected 21 contestants, got ${contestants}`);
if (managers !== 23) fail(`expected 23 managers, got ${managers}`);

const info = readFileSync(new URL("../ios/SurvivorDraft/Info.plist", import.meta.url), "utf8");
for (const word of ["NSCameraUsageDescription", "NSLocationWhenInUseUsageDescription", "NSContactsUsageDescription"]) {
  if (info.includes(word)) fail(`Info.plist asks for ${word}`);
}
if (!info.includes("ITSAppUsesNonExemptEncryption")) fail("Info.plist missing encryption exemption");

const manifest = readFileSync(new URL("../android/android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8");
for (const word of ["CAMERA", "RECORD_AUDIO", "ACCESS_FINE_LOCATION", "READ_CONTACTS", "com.android.vending.BILLING"]) {
  if (manifest.includes(word)) fail(`AndroidManifest requests ${word}`);
}

const gradle = readFileSync(new URL("../android/android/app/build.gradle", import.meta.url), "utf8");
const applied = (id) =>
  gradle.split("\n").some((line) => {
    const trimmed = line.trim();
    return !trimmed.startsWith("//") && trimmed.includes(id);
  });
if (applied("com.google.firebase.crashlytics")) fail("Crashlytics plugin must stay off until a config file exists");
if (applied("com.google.gms.google-services")) fail("Google services plugin is enabled without a config file");

const rn = spawnSync("npx", ["tsc", "--noEmit", "-p", "android/tsconfig.json"], { stdio: "inherit" });
if (rn.status !== 0) fail("React Native typecheck failed");

console.log("swift structure ok, android permissions ok, react native typecheck passed");
