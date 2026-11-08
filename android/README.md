# Survivor Fantasy Draft (Android)

The Play Store app is the Gradle project in `android/android`. Open that folder in Android Studio and run it. Application id `com.tanre77.survivordraft`, version 1.0 (versionCode 1), min SDK 26, target SDK 36.

```sh
cd android/android
./gradlew assembleRelease
```

Without `ANDROID_KEYSTORE_PATH` the release APK and AAB are unsigned. Set the keystore variables from [RELEASE.md](../RELEASE.md) before you upload. The board is `app/src/main/assets/board.json`, rewritten by `npm run board` from `shared/board.json`. A boot stays off the score until its `revealAt`, which is 9:30pm Eastern for a Wednesday episode.

The manifest requests no permissions. The buy-in stays outside the app. Colors are the dark palette in `app/src/main/res/values/colors.xml`, the same hexes as `src/styles.css`.

`google-services.json` is intentionally absent. Leave the Google and Crashlytics plugins commented out until that file is the real one from your Firebase project.

`android/App.tsx` is a React Native view of the same board. CI typechecks it (`npm install --prefix android --ignore-scripts && npm run check:native`). It is not the binary that `bundleRelease` produces.

In Play Console, set the privacy policy to the published site's `/privacy.html` and support to `/support.html`.
