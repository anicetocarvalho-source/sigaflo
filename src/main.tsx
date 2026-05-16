import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Service Worker — only register in production AND outside iframes/preview
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app") && window.location.hostname.startsWith("id-preview--");

if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD && !isInIframe && !isPreviewHost) {
    import("virtual:pwa-register").then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          // New version available — activate and reload immediately
          updateSW(true);
        },
        onRegisteredSW(_swUrl, registration) {
          // Check for updates every 60s while app is open
          if (registration) {
            setInterval(() => registration.update().catch(() => {}), 60_000);
          }
        },
      });
      // Reload once when a new SW takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }).catch(() => {});
  } else {
    // cleanup any stale SW in dev/preview
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
  }
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
