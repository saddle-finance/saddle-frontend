export function getFormattedShortTime(timestamp: string | number): string {
  const timestampNumber =
    typeof timestamp === "string" ? parseInt(timestamp) : timestamp
  const timeoptions = {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const
  return new Date(timestampNumber * 1000)
    .toLocaleTimeString([], timeoptions)
    .replace(",", "")
}
