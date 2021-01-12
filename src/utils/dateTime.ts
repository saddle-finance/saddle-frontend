export function getFormattedTimeString(): string {
  const now = new Date()
  return now.toLocaleTimeString()
}
