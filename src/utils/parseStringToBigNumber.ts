import { BigNumber } from "@ethersproject/bignumber"
import { parseUnits } from "@ethersproject/units"

/**
 * Parses a user input string into a BigNumber.
 * Uses the native precision of the token if a tokenSymbol is provided
 * Defaults to a value of 0 if string cannot be parsed
 *
 * @param {string} valueRaw
 * @param {number} precision
 * @param {BigNumber} fallback
 * @return {Object} result
 * @return {BigNumber} result.value
 * @return {boolean} result.isFallback
 * }
 */
export default function parseStringToBigNumber(
  valueRaw: string,
  precision: number,
  fallback?: BigNumber,
): { value: BigNumber; isFallback: boolean } {
  let valueSafe: BigNumber
  let isFallback: boolean
  try {
    // attempt to parse string. Use fallback value if library error is thrown
    valueSafe = parseUnits(valueRaw, precision)
    isFallback = false
  } catch {
    valueSafe = fallback ?? BigNumber.from("0")
    isFallback = true
  }
  return { value: valueSafe, isFallback }
}
