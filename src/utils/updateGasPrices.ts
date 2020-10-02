import { AppDispatch } from "../state"
import { updateGasPrices } from "../state/application"

const gasAPI = "https://gasprice.poa.network/"

interface GasResponse {
  standard: number
  fast: number
  instant: number
  health: boolean
}

export default function fetchGasPrices(dispatch: AppDispatch): void {
  fetch(gasAPI)
    .then((res) => res.json())
    .then((body: GasResponse) => {
      const { standard, fast, instant, health } = body
      if (health) {
        dispatch(
          updateGasPrices({
            gasStandard: Math.round(standard),
            gasFast: Math.round(fast),
            gasInstant: Math.round(instant),
          }),
        )
      }
    })
}
