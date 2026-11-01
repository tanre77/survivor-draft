# Survivor Fantasy Draft (Xcode)

Open [SurvivorDraft.xcodeproj](SurvivorDraft.xcodeproj) in Xcode. The scheme is SurvivorDraft. Pick an iPhone simulator and press Run.

The leagues screen splits Survivor 51 into In progress and Finished. It stays in progress while anyone is still active. You switches System, Dark, and Light. Colors are generated from `src/styles.css` (`npm run board` writes `Palette.swift`). A Wednesday boot stays off the board until 9:30pm Eastern, and the boot callout is the latest night. The phone does not email the next draft seat. That mail runs on the server, and this app does not call it.

Signing is off so the project compiles before an Apple team is chosen. Before you archive for the App Store, select the SurvivorDraft target, turn on Automatically manage signing, and pick your team. Bundle id `com.tanre77.survivordraft`, version 1.0 (1). Use the published site’s `/privacy.html` and `/support.html`.

`GoogleService-Info.plist` is intentionally absent. Add the real file from your Firebase project, then uncomment the two lines in `CrashReporting.swift` and add the FirebaseCrashlytics Swift package. A placeholder plist would point Crashlytics at the wrong project.

The app asks for no camera, microphone, location, contacts, or tracking. It does not take payment. `PrivacyInfo.xcprivacy` says the app collects nothing.
