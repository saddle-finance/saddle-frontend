import { GasPrices } from "../state/user"
import { NumberInputState } from "./numberInputState"

export function formatGasToString(
  gasPricesGwei: {
    gasStandard?: number
    gasFast?: number
    gasInstant?: number
  },
  gasSelected: GasPrices,
  gasCustom?: NumberInputState,
): string {
  const { gasStandard = 0, gasFast = 0, gasInstant = 0 } = gasPricesGwei
  let gasPrice
  if (gasSelected === GasPrices.Custom) {
    gasPrice = gasCustom?.valueSafe
  } else if (gasSelected === GasPrices.Fast) {
    gasPrice = gasFast
  } else if (gasSelected === GasPrices.Instant) {
    gasPrice = gasInstant
  } else {
    gasPrice = gasStandard
  }
  return String(gasPrice)
}
