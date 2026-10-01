import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { reportError } from "@/lib/diagnostics";
import appCss from "../styles.css?url";

const APP_NAME = "Survivor 51 Draft";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#100e0c" },
      { name: "description", content: "The Survivor 51 family draft. A private scoreboard. No payments." },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  errorComponent: function RootError({ error }) {
    if (typeof window !== "undefined") reportError(error);
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center bg-bg px-4 text-fg">
        <h1 className="font-display text-5xl leading-none">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted">Your draft is still on this device.</p>
        <a href="/" className="mt-6 text-sm font-semibold text-toka">
          Back to the board
        </a>
      </main>
    );
  },
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
