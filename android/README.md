# Survivor Fantasy Draft (Android Studio)

Open the `android/android` folder in Android Studio and let it install the Android SDK if it asks. Then press Run. The app module is a normal Gradle application. It does not use React Native.

```sh
cd android/android
./gradlew assembleDebug
```

Application id `com.tanre77.survivordraft`, version 1.0 (versionCode 1), compile SDK 35. The board is `app/src/main/assets/board.json`. The manifest requests no permissions. The buy-in stays outside the app.

`google-services.json` is intentionally absent. Leave Crashlytics off until that file is the real one from your Firebase project.
