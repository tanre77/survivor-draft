import Foundation

/// Crashlytics stays off until GoogleService-Info.plist is in the app target.
/// Shipping a placeholder plist would send reports to the wrong project and fail review.
enum CrashReporting {
    static func start() {
        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else { return }
        // After you add the FirebaseCrashlytics package and the real plist:
        // FirebaseApp.configure()
        // Crashlytics.crashlytics().setCrashlyticsCollectionEnabled(true)
    }

    static func record(_ error: Error) {
        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else { return }
        // Crashlytics.crashlytics().record(error: error)
        _ = error
    }
}
