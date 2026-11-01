# Survivor Fantasy Draft (Xcode)

Open [SurvivorDraft.xcodeproj](SurvivorDraft.xcodeproj) in Xcode. The scheme is SurvivorDraft. Pick an iPhone simulator and press Run.

Signing is off so the project compiles before an Apple team is chosen. Before you archive for the App Store, select the SurvivorDraft target, turn on Automatically manage signing, and pick your team. Bundle id `com.tanre77.survivordraft`, version 1.0 (1). Use the published site’s `/privacy.html` and `/support.html`.

`GoogleService-Info.plist` is intentionally absent. Add the real file from your Firebase project, then uncomment the two lines in `CrashReporting.swift` and add the FirebaseCrashlytics Swift package. A placeholder plist would point Crashlytics at the wrong project.

The app asks for no camera, microphone, location, contacts, or tracking. It does not take payment. `PrivacyInfo.xcprivacy` says the app collects nothing.
