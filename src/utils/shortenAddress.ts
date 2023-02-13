import { isAddress } from "./index"

export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)

  return parsed
    ? `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
    : ""
}
