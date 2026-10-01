/** Crashlytics is a native module. It stays off until google-services.json exists. */
export function startDiagnostics(): void {
  // After adding @react-native-firebase/app and crashlytics plus the real google-services.json:
  // crashlytics().setCrashlyticsCollectionEnabled(true)
}

export function reportError(error: unknown): void {
  console.error(error);
}
