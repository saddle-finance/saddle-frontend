let counter = 0

export default function getUniqueId(): string {
  return `id-${counter++}`
}
