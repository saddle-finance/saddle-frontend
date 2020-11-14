import { BigNumber } from "@ethersproject/bignumber"
import parseStringToBigNumber from "../utils/parseStringToBigNumber"

export interface NumberInputState {
  isEmpty: boolean
  isValid: boolean
  precision: number
  valueRaw: string
  valueSafe: string // represents a BigNumber
}

/**
 * A curried function for representing user inputted number values.
 * Can be used to show errors in the UI, as well as safely interacting with the blockchain
 * @param {number} precision
 * @param {BigNumber} fallback
 * @return {function}
 */
export function numberInputStateCreator(
  precision: number,
  fallback: BigNumber,
) {
  /**
   * Transforms a user inputted string into a more verbose format including BigNumber representation
   * @param {string} valueRaw
   * @return {NumberInputState}
   */
  return function createNumberInputState(valueRaw: string): NumberInputState {
    const { value: valueSafe, isFallback } = parseStringToBigNumber(
      valueRaw,
      precision,
      fallback,
    )
    return {
      isEmpty: valueRaw === "",
      isValid: !isFallback,
      precision,
      valueRaw,
      valueSafe: valueSafe.toString(),
    }
  }
}
