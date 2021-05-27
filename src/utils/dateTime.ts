export function getFormattedTimeString(): string {
  const now = new Date()
  return now.toLocaleTimeString()
}

export function getFormattedShortTime(timestamp: string): string {
  const timeoptions = {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const
  return new Date(parseInt(timestamp) * 1000).toLocaleTimeString(
    [],
    timeoptions,
  )
}
