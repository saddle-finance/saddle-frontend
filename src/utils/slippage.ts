import { BigNumber } from "@ethersproject/bignumber"
import { NumberInputState } from "./numberInputState"
import { Slippages } from "../state/user"
import { formatUnits } from "@ethersproject/units"

/**
 * Given an input value and slippage redux state values, do the math.
 * @param {BigNumber} inputValue
 * @param {Slippages} slippageSelected
 * @param {NumberInputState} slippageCustom
 * @return {BigNumber}
 */
export function applySlippage(
  inputValue: BigNumber,
  slippageSelected: Slippages,
  slippageCustom?: NumberInputState,
): BigNumber {
  if (slippageSelected === Slippages.Custom && !!slippageCustom) {
    const customDenominator = BigNumber.from(10).pow(
      slippageCustom.precision + 2,
    )
    const customNumerator = customDenominator.sub(slippageCustom.valueSafe)
    return inputValue.mul(customNumerator).div(customDenominator)
  } else if (slippageSelected === Slippages.OneTenth) {
    return inputValue.mul(999).div(1000)
  } else {
    // default to 1%
    return inputValue.mul(99).div(100)
  }
}

export function formatSlippageToString(
  slippageSelected: Slippages,
  slippageCustom?: NumberInputState,
): string {
  if (slippageSelected === Slippages.Custom && !!slippageCustom) {
    return formatUnits(slippageCustom.valueSafe, slippageCustom?.precision)
  } else if (slippageSelected === Slippages.OneTenth) {
    return formatUnits(BigNumber.from(1), 3)
  } else if (slippageSelected === Slippages.One) {
    return formatUnits(BigNumber.from(1), 2)
  } else {
    return "N/A"
  }
}
