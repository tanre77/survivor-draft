# Survivor Fantasy Draft (SwiftUI)

Native iOS app. Same board as the website, generated from `shared/board.json`.

This repository is built on Linux, which has no Xcode. Open the folder on a Mac:

```sh
brew install xcodegen
cd ios
xcodegen generate
xcodebuild -scheme SurvivorDraft -destination 'platform=iOS Simulator,name=iPhone 16' test
```

`GoogleService-Info.plist` is intentionally absent. Add the real file from your Firebase project, then uncomment the two lines in `CrashReporting.swift` and add the FirebaseCrashlytics Swift package. A placeholder plist would point Crashlytics at the wrong project.

The app asks for no camera, microphone, location, contacts, or tracking. It does not take payment. Encryption export is marked exempt in Info.plist. `PrivacyInfo.xcprivacy` says the app collects nothing.

App Store: bundle id `com.tanre77.survivordraft`, version 1.0 (1). Archive from Xcode and upload with the privacy URL and support URL of the published site (`/privacy.html` and `/support.html`). Leave Crashlytics off until the real Firebase file is in the target. Add a 1024×1024 icon at `SurvivorDraft/Assets.xcassets/AppIcon.appiconset` before you submit if Xcode does not already show one.
