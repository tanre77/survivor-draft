# Release checklist

One codebase for the website, the iOS app, and the Android app. Nothing in this file publishes a build. Store uploads run only when someone starts the **release** GitHub Actions workflow by hand.

| Platform | What ships | Id | Version |
| --- | --- | --- | --- |
| Web | Vercel (Nitro preset in `vite.config.ts`) | — | the deployed commit |
| iOS | App Store / TestFlight | `com.tanre77.survivordraft` | 1.0 (1) |
| Android | Play internal track, then production | `com.tanre77.survivordraft` | 1.0 (`versionCode` 1) |

Privacy and support pages already live in the repo. Point both stores at the published site:

- Privacy: `https://<your host>/privacy.html` (`public/privacy.html`)
- Support: `https://<your host>/support.html` (`public/support.html`)

`store/listing.json` records those paths. The release lane prints the full URLs from the `PUBLIC_WEB_ORIGIN` secret and, only if you check **upload metadata**, writes them into App Store Connect or Play.

## Done

- `survivor-draft`, `android`, and `ios` are combined on this branch. `npm run board` regenerates `shared/board.json`, the Swift board, the React Native board, and `android/android/app/src/main/assets/board.json`.
- Android (the Gradle app and the React Native UI) hides a boot until `revealAt`. Wednesday eliminations in the board use 9:30pm Eastern. Ori's card is `2026-10-29T01:30:00.000Z`.
- Android colors match the dark tokens in `src/styles.css` (`bg`, `surface`, `fg`, `muted`, `savu`, `toka`, `ember`, `boot`). The React Native muted color is `#a89886`.
- iOS keeps the existing SwiftUI screens. Signing is allowed in the Xcode project so an archive can be uploaded. Simulator CI passes `CODE_SIGNING_ALLOWED=NO`. `PrivacyInfo.xcprivacy` is in the app target. `Info.plist` does not ask for camera, location, contacts, or microphone, and it marks encryption as exempt. Marketing version and build number come from `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` (1.0 / 1).
- CI runs typecheck, lint, the full Node test suite, the production web build, the native score check, an unsigned Android release APK and AAB, and (when `ios/**` changes) an iOS simulator build and test.
- `.github/workflows/release.yml` can upload to TestFlight and the Play internal track. It is `workflow_dispatch` only. It refuses to run until the secrets below exist, and the Play upload is a **draft** on the internal track.

## Still needed before a store submission

- A real 1024×1024 iOS icon. `ios/SurvivorDraft/Assets.xcassets/AppIcon.appiconset/AppIcon.png` is a two-color placeholder.
- Android launcher icons above the 48px mdpi placeholder in `android/android/app/src/main/res/mipmap-mdpi/`. Add hdpi, xhdpi, xxhdpi, and xxxhdpi, plus a 512×512 Play listing icon.
- Phone screenshots for App Store Connect (6.7" and 6.1") and Play Console (phone). None are in the repo.
- A public web origin, so the privacy and support URLs resolve. The site is not given a hostname in this repo.
- Apple Developer membership, an App Store Connect app record for `com.tanre77.survivordraft`, and a distribution certificate plus App Store profile (match, or the equivalent cert and profile).
- A Play Console app for `com.tanre77.survivordraft` and an upload keystore. Play App Signing can hold the app signing key; the repo never stores it.
- Firebase, only if crash reporting should turn on. Until `google-services.json` and `GoogleService-Info.plist` are the real files, leave the Gradle plugins and `CrashReporting.swift` as they are. Do not commit those files.
- Hosting accounts and the environment variables in the web section below.

## Secrets

Set these as GitHub Actions secrets. Do not commit them, and do not put them in a `.env` file in git.

| Secret | Used for |
| --- | --- |
| `APP_STORE_CONNECT_API_KEY` | Contents of the App Store Connect API `.p8` (or that file, base64-encoded) |
| `APP_STORE_CONNECT_KEY_ID` | The key id |
| `APP_STORE_CONNECT_ISSUER_ID` | The issuer id |
| `APPLE_TEAM_ID` | Apple Developer team id |
| `MATCH_GIT_URL` | Private match repo with the Apple Distribution cert and App Store profile |
| `MATCH_PASSWORD` | Passphrase for that match repo |
| `MATCH_GIT_BASIC_AUTHORIZATION` | Optional. Required when the match repo is private |
| `ANDROID_KEYSTORE_BASE64` | Base64 of the upload keystore (`.jks` or `.keystore`) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play Console service account JSON with release permission |
| `PUBLIC_WEB_ORIGIN` | `https://host` with no trailing slash. Privacy and support URLs are this plus `/privacy.html` and `/support.html` |

Accounts you create outside GitHub:

- Apple Developer team (the team id goes in `APPLE_TEAM_ID`).
- App Store Connect app record, bundle id `com.tanre77.survivordraft`.
- Play Console app, application id `com.tanre77.survivordraft`, plus the upload key.
- Firebase project, only when you want Crashlytics or web analytics.
- Vercel project (or another host that can run the Nitro Vercel output) for the website.
- A Postgres database (Neon is what `DATABASE_URL` selects) when leagues should survive a restart.

## Web

Production build, from a clean tree:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` runs the Vite/Nitro production build (`preset: "vercel"` in `vite.config.ts`) and then `npm run db:migrate`. With no `DATABASE_URL`, migrate skips and the preview database is in-memory PGLite. On Vercel, set `DATABASE_URL` so migrate applies `migrations/` to Postgres. `vercel.json` only overrides the install command (`npm install --omit=dev`).

Deploy by connecting this branch to the Vercel project and setting the variables there. This checklist does not deploy.

| Variable | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | For a durable site | Postgres connection string. Empty means PGLite, which does not survive a serverless process. |
| `VITE_AUTH_ENABLED` | No | `false` (the default in this app's env wrapper) keeps sign-in off. Set `true` only when the Better Auth variables below are set. |
| `BETTER_AUTH_SECRET` | When auth is on | Session signing secret. |
| `BETTER_AUTH_URL` | When auth is on | Public origin, such as `https://<your host>`. |
| `GROK_AUTH_ISSUER` | When auth is on | Grok auth broker. Has a built-in default. |
| `GROK_AUTH_CLIENT_ID` | When auth is on | This app's broker client id. |
| `GROK_AUTH_CLIENT_SECRET` | When auth is on | This app's broker client secret. |
| `GROK_PROJECT_ID` | When the Grok gate is on | Audience for connector and gate tokens. |
| `GROK_GATE_ORIGIN` | No | Override for the gate issuer. |
| `GROK_CONNECTORS_URL` | For turn mail off `*.grok.me` | Base URL for the Gmail connector. On `*.grok.me` the host is chosen for you. |
| `GROK_CONNECTOR_ACCESS_TOKEN` | Local preview only | Ignored when `NODE_ENV=production`. Production turn mail uses the connector token on the request. |
| `VITE_FIREBASE_API_KEY` | No | Web diagnostics stay off until this and the three below are all set. |
| `VITE_FIREBASE_AUTH_DOMAIN` | No | Firebase web config. |
| `VITE_FIREBASE_PROJECT_ID` | No | Firebase web config. |
| `VITE_FIREBASE_APP_ID` | No | Firebase web config. |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Turns on Analytics when the rest of the web config is set. |

Turn mail (`src/lib/turn-mail.ts`) emails the seat that is on the clock through the Grok Gmail connector. It needs a host that can reach that connector and a `DATABASE_URL` so `turn_alerts` (migration `0006_turn_email.sql`) exists.

Refresh the native boards after a cast or boot change:

```sh
npm run board
npm run check:native
```

## iOS

From a Mac, after `brew install xcodegen`:

```sh
npm ci
npm run board
cd ios
xcodegen generate
xcodebuild -project SurvivorDraft.xcodeproj -scheme SurvivorDraft \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=- \
  build test
```

CI does the same on `macos-15` and picks the first available iPhone simulator. Open `ios/SurvivorDraft.xcodeproj` in Xcode to run on a phone. The project does not contain a team id.

To upload, add the Apple secrets and start **Actions → release → Run workflow**, platform `ios`. That lane runs match, archives, and uploads to TestFlight. It does not submit for review. Leave **upload metadata** off until the App Store Connect record exists and you want the listing text (including the privacy and support URLs) pushed. The committed template is `ios/ExportOptions.plist`; the lane writes a filled-in copy under `ios/build/` from the match profile name.

Bump a build by changing `CURRENT_PROJECT_VERSION` in `ios/project.yml`, then `xcodegen generate`. Bump the user-facing version with `MARKETING_VERSION`. `Info.plist` reads both.

## Android

Unsigned release build (what CI uploads as an artifact):

```sh
cd android/android
./gradlew assembleRelease bundleRelease
```

The APK is `app/build/outputs/apk/release/app-release-unsigned.apk`. The bundle is `app/build/outputs/bundle/release/app-release.aab` (unsigned unless the signing variables are set).

Signed release, from the environment or `~/.gradle/gradle.properties` (never from a file in git):

```sh
export ANDROID_KEYSTORE_PATH="$HOME/upload.keystore"
export ANDROID_KEYSTORE_PASSWORD="…"
export ANDROID_KEY_ALIAS="…"
export ANDROID_KEY_PASSWORD="…"
export VERSION_CODE=1
export VERSION_NAME=1.0
cd android/android
./gradlew bundleRelease
```

`minSdk` is 26, `targetSdk` and `compileSdk` are 36, application id `com.tanre77.survivordraft`. Java 17. Android Gradle Plugin 8.9.1.

Play upload: add the Android secrets and run the **release** workflow with platform `android`. The bundle goes to the internal track as a **draft**. Promote it in Play Console yourself. In Play Console, set the privacy policy to `https://<your host>/privacy.html` and support to `https://<your host>/support.html`, or check **upload metadata** once to push `fastlane/metadata/android/en-US/`.

The React Native tree under `android/` is typechecked by `npm run check:native`. The Play binary is the Gradle app in `android/android`, not a React Native bundle.

`google-services.json` stays absent. The Google and Crashlytics Gradle plugins stay commented out.

## Commands before you tag

```sh
npm ci
npm install --prefix android --ignore-scripts
npm run typecheck
npm run lint
npm test
npm run build
npm run check:native
cd android/android && ./gradlew assembleRelease bundleRelease
```

On a Mac, also run the `xcodebuild` command in the iOS section.
