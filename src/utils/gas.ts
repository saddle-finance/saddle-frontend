import { BigNumber } from "ethers"
import { GasPrices } from "../state/user"
import { NumberInputState } from "./numberInputState"

export function gasBNFromState(
  gasPricesGwei: {
    gasStandard?: number
    gasFast?: number
    gasInstant?: number
  },
  gasSelected: GasPrices,
  gasCustom?: NumberInputState,
): BigNumber {
  const { gasStandard = 0, gasFast = 0, gasInstant = 0 } = gasPricesGwei
  let gasPrice
  if (gasSelected === GasPrices.Custom) {
    gasPrice = gasCustom?.valueSafe
  } else if (gasSelected === GasPrices.Standard) {
    gasPrice = gasStandard
  } else if (gasSelected === GasPrices.Instant) {
    gasPrice = gasInstant
  } else {
    gasPrice = gasFast
  }
  return BigNumber.from(gasPrice)
}

export function formatGasToString(
  gasPricesGwei: {
    gasStandard?: number
    gasFast?: number
    gasInstant?: number
  },
  gasSelected: GasPrices,
  gasCustom?: NumberInputState,
): string {
  return gasBNFromState(gasPricesGwei, gasSelected, gasCustom).toString()
}
