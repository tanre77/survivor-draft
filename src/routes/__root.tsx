import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { reportError } from "@/lib/diagnostics";
import { applyTheme, watchTheme } from "@/data/theme";
import appCss from "../styles.css?url";

const APP_NAME = "Survivor Fantasy Draft";

function ThemeBoot() {
  useLayoutEffect(() => {
    applyTheme();
    return watchTheme();
  }, []);
  return null;
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#100e0c" },
      { name: "description", content: "A Survivor fantasy draft, played like fantasy football. Private family scoreboard. No payments." },
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var c=localStorage.getItem("s51-theme")||"system";var dark=c==="dark"||(c!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var t=dark?"dark":"light";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;var m=document.querySelector(\'meta[name="theme-color"]\');if(m)m.setAttribute("content",dark?"#100e0c":"#f4efe6");}catch(e){}})();',
          }}
        />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <ThemeBoot />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
