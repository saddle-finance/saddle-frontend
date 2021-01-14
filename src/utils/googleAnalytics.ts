export function logEvent(name: string, params: Record<string, string>): void {
  // gtag is only loaded in index.html when NODE_ENV is set to production, so check if it's a function
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params)
  } else {
    console.debug(`Logging event '${name}' with parameters: `, params)
  }
}
