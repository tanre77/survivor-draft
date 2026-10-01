# Survivor Fantasy Draft (React Native, Android)

React Native UI over the same `shared/board.json` the SwiftUI app uses.

This repository is built on Linux without an Android SDK, so CI typechecks the React Native source instead of assembling an APK. On a machine with Android Studio:

```sh
cd android
npm install
npm run typecheck
npx react-native run-android
```

`google-services.json` is intentionally absent. Download it from your Firebase project, place it at `android/app/google-services.json`, uncomment the two Gradle plugins, and add `@react-native-firebase/app` and `@react-native-firebase/crashlytics`.

The manifest requests Internet only. No location, contacts, camera, microphone, ads, or billing. The family buy-in stays outside the app, which is what Play review expects for a private scoreboard.
