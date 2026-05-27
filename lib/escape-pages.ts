import { LAUNCH_SETTLE_MS, OPEN_CONFIRM_WINDOW_MS } from "@/lib/constants";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function baseDocument(params: { body: string; title: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(params.title)}</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:24px;background:#081225;color:#e5eefc;font-family:Segoe UI,Arial,sans-serif}
    .card{width:min(100%,560px);background:rgba(12,24,47,.92);border:1px solid rgba(130,151,190,.18);border-radius:24px;padding:32px;box-shadow:0 28px 72px rgba(0,0,0,.35)}
    .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7fb7ff;margin:0 0 14px}
    h1{margin:0 0 12px;font-size:28px;line-height:1.1}
    p{margin:0;color:#adc2e3;line-height:1.6}
    .spinner{width:52px;height:52px;border-radius:50%;border:4px solid rgba(127,183,255,.18);border-top-color:#7fb7ff;animation:spin .85s linear infinite;margin:0 0 22px}
    .actions{margin-top:24px;display:flex;flex-wrap:wrap;gap:12px}
    .button{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:#7fb7ff;color:#081225;text-decoration:none;font-weight:700}
    .secondary{background:transparent;color:#d5e6ff;border:1px solid rgba(127,183,255,.32)}
    .meta{margin-top:16px;font-size:13px;color:#7f96ba}
    .hidden{display:none}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>${params.body}</body>
</html>`;
}

export function renderAndroidEscapePage(params: {
  title: string;
  destinationHref: string;
  beaconHref: string;
  intentHref: string;
  attemptedMethod: string;
  experimentLane?: string | null;
  autoAttemptConsumed: boolean;
}) {
  const safeTitle = escapeHtml(params.title);
  const safeDestination = escapeHtml(params.destinationHref);

  return baseDocument({
    title: `Opening ${safeTitle}`,
    body: `<main class="card">
      <div class="spinner" aria-hidden="true"></div>
      <p class="eyebrow">External Browser Routing</p>
      <h1>Opening ${safeTitle}</h1>
      <p>We are moving this visit into your browser so attribution and retargeting stay intact.</p>
      <div id="fallback" class="hidden">
        <div class="actions">
          <a class="button" href="${safeDestination}">Continue in Browser</a>
          <a class="button secondary" href="${safeDestination}">Open Fallback</a>
        </div>
        <p class="meta">If the browser launch is blocked, the fallback keeps the visit alive without retry loops.</p>
      </div>
    </main>
    <script>
      (function () {
        var beaconHref = ${JSON.stringify(params.beaconHref)};
        var destinationHref = ${JSON.stringify(params.destinationHref)};
        var intentHref = ${JSON.stringify(params.intentHref)};
        var attemptedMethod = ${JSON.stringify(params.attemptedMethod)};
        var experimentLane = ${JSON.stringify(params.experimentLane || null)};
        var autoAttemptConsumed = ${JSON.stringify(params.autoAttemptConsumed)};
        var launchSettleMs = ${LAUNCH_SETTLE_MS};
        var confirmWindowMs = ${OPEN_CONFIRM_WINDOW_MS};
        var hiddenObserved = false;
        var fallbackShown = false;

        function sendEvent(eventName, latencyMs) {
          var payload = JSON.stringify({
            eventName: eventName,
            latencyMs: latencyMs,
            attemptedMethod: attemptedMethod,
            experimentLane: experimentLane
          });

          if (navigator.sendBeacon) {
            navigator.sendBeacon(beaconHref, payload);
            return;
          }

          fetch(beaconHref, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true
          }).catch(function () {});
        }

        function showFallback() {
          if (fallbackShown) return;
          fallbackShown = true;
          document.getElementById("fallback").classList.remove("hidden");
          sendEvent("fallback_rendered", launchSettleMs);
        }

        function onHidden() {
          if (hiddenObserved) return;
          hiddenObserved = true;
          sendEvent("hidden_observed", Date.now() - startedAt);
        }

        var startedAt = Date.now();
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) onHidden();
        });
        window.addEventListener("pagehide", onHidden);

        if (autoAttemptConsumed) {
          sendEvent("launch_attempted", 0);
          try {
            window.location.href = intentHref;
          } catch (error) {
            sendEvent("intent_rejected", Date.now() - startedAt);
          }
        } else {
          showFallback();
          sendEvent("scheme_unavailable", 0);
        }

        window.setTimeout(function () {
          if (!document.hidden) {
            showFallback();
          }
        }, launchSettleMs);

        window.setTimeout(function () {
          if (hiddenObserved) {
            sendEvent("escape_hidden_no_land", Date.now() - startedAt);
          } else {
            sendEvent("watchdog_timeout", Date.now() - startedAt);
          }
        }, confirmWindowMs);
      })();
    </script>`
  });
}

export function renderIosContainmentPage(params: {
  title: string;
  destinationHref: string;
  beaconHref: string;
}) {
  const safeTitle = escapeHtml(params.title);
  const safeDestination = escapeHtml(params.destinationHref);

  return baseDocument({
    title: `Opening ${safeTitle}`,
    body: `<main class="card">
      <div class="spinner" aria-hidden="true"></div>
      <p class="eyebrow">Tracked iOS Flow</p>
      <h1>Preparing ${safeTitle}</h1>
      <p>This visit stays measurable even when X keeps the user inside its in-app browser.</p>
      <div class="actions">
        <a class="button" href="${safeDestination}">Continue</a>
      </div>
      <p class="meta">Server-side attribution is already preserved before the destination opens.</p>
    </main>
    <script>
      (function () {
        var beaconHref = ${JSON.stringify(params.beaconHref)};
        var destinationHref = ${JSON.stringify(params.destinationHref)};
        var payload = JSON.stringify({ eventName: "ios_containment_viewed", latencyMs: 0 });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(beaconHref, payload);
        } else {
          fetch(beaconHref, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true
          }).catch(function () {});
        }

        window.setTimeout(function () {
          window.location.replace(destinationHref);
        }, 500);
      })();
    </script>`
  });
}
