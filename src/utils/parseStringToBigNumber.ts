import { BigNumber } from "@ethersproject/bignumber"
import { TOKENS_MAP } from "../constants"
import { parseUnits } from "@ethersproject/units"

/**
 * Parses a user input string into a BigNumber.
 * Uses the native precision of the token if a tokenSymbol is provided
 * Defaults to a value of 0 if string cannot be parsed
 *
 * @param {string} value
 * @param {string} tokenSymbol
 * @return {BigNumber}
 */
export default function parseStringToBigNumber(
  value: string,
  tokenSymbol?: string,
): BigNumber {
  let safeValue: BigNumber
  try {
    // attempt to parse string. Fall back to 0 otherwise
    safeValue = parseUnits(
      value,
      tokenSymbol ? TOKENS_MAP[tokenSymbol]?.decimals : 18,
    )
  } catch {
    safeValue = BigNumber.from("0")
  }
  return safeValue
}
