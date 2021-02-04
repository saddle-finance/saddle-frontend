import { Metric } from "web-vitals"

export function logEvent(name: string, params: Record<string, unknown>): void {
  // gtag is only loaded in index.html when NODE_ENV is set to production, so check if it's a function
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params)
  } else {
    console.debug(`Logging event ${name} with parameters:`, params)
  }
}

export function logError(error: ErrorEvent): void {
  logEvent("exception", {
    description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
    fatal: true,
  })
}

// See: https://github.com/GoogleChrome/web-vitals#using-gtagjs-google-analytics-4
export function sendWebVitalsToGA({ name, delta, value, id }: Metric): void {
  logEvent(name, {
    // Use the metric delta as the event's value parameter.
    value: delta,
    // Everything below is a custom event parameter.
    web_vitals_metric_id: id, // Needed to aggregate events.
    web_vitals_metric_value: value, // Optional
    // Any additional params or metadata (e.g. debug information) can be
    // set here as well, within the following limitations:
    // https://support.google.com/analytics/answer/9267744
  })
}
