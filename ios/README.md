# Survivor Fantasy Draft (SwiftUI)

Native iOS app. Same board as the website, generated from `shared/board.json` into `SurvivorDraft/Generated/BoardData.swift`.

The leagues screen splits Survivor 51 into In progress and Finished. It stays in progress while anyone is still active. You switches System, Dark, and Light. Colors are generated from `src/styles.css` (`npm run board` writes `Palette.swift`). A Wednesday boot stays off the board until 9:30pm Eastern, and the boot callout is the latest night. The phone does not email the next draft seat. That mail runs on the server, and this app does not call it.

```sh
brew install xcodegen
npm run board
cd ios
xcodegen generate
xcodebuild -project SurvivorDraft.xcodeproj -scheme SurvivorDraft \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=- \
  build test
```

`xcodegen` reads `project.yml`. Bundle id `com.tanre77.survivordraft`, iOS 17, version 1.0 (build 1). Signing stays on in the project so an archive can be uploaded. The simulator command above turns it off, and CI does the same. The team id is not in the project. [RELEASE.md](../RELEASE.md) lists the Apple secrets, `ios/ExportOptions.plist`, and the TestFlight workflow.

`GoogleService-Info.plist` is intentionally absent. Add the real file from your Firebase project, then uncomment the two lines in `CrashReporting.swift` and add the FirebaseCrashlytics Swift package. A placeholder plist would point Crashlytics at the wrong project.

The app asks for no camera, microphone, location, contacts, or tracking. It does not take payment. Encryption export is marked exempt in Info.plist. `PrivacyInfo.xcprivacy` says the app collects nothing.

App Store privacy and support URLs are the published site's `/privacy.html` and `/support.html` (`public/privacy.html` and `public/support.html`). Replace the placeholder 1024×1024 icon in `SurvivorDraft/Assets.xcassets/AppIcon.appiconset` before you submit.
