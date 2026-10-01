# Survivor Draft (SwiftUI)

Native iOS app. Same board as the website, generated from `shared/board.json`.

This repository is built on Linux, which has no Xcode. Open the folder on a Mac:

```sh
brew install xcodegen
cd ios
xcodegen generate
xcodebuild -scheme SurvivorDraft -destination 'platform=iOS Simulator,name=iPhone 16' test
```

`GoogleService-Info.plist` is intentionally absent. Add the real file from your Firebase project, then uncomment the two lines in `CrashReporting.swift` and add the FirebaseCrashlytics Swift package. A placeholder plist would point Crashlytics at the wrong project.

The app asks for no camera, microphone, location, or contacts. It does not take payment. Encryption export is marked exempt in Info.plist.
