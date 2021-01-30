const PRODUCTION = "production"
export function isProduction(): boolean {
  return process.env.NODE_ENV === PRODUCTION
}
