type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  measurementId?: string;
};

function webConfig(): FirebaseWebConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

let started = false;

/** Crashlytics is iOS and Android only. On the web, diagnostics stay off until Firebase web config is set. */
export function startDiagnostics(): void {
  if (started || typeof window === "undefined") return;
  const config = webConfig();
  if (!config) return;
  started = true;
  void import("firebase/app")
    .then(({ initializeApp }) => {
      const app = initializeApp(config);
      if (!config.measurementId) return;
      return import("firebase/analytics").then(({ getAnalytics, isSupported }) =>
        isSupported().then((ok) => {
          if (ok) getAnalytics(app);
        }),
      );
    })
    .catch((error: unknown) => {
      console.error(error);
    });
}

export function reportError(error: unknown): void {
  console.error(error);
  const bridge = (window as Window & { SurvivorCrashlytics?: { record: (message: string) => void } }).SurvivorCrashlytics;
  const message = error instanceof Error ? error.message : String(error);
  bridge?.record(message);
}
