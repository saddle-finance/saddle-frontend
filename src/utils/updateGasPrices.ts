import { AppDispatch } from "../state"
import retry from "async-retry"
import { updateGasPrices } from "../state/application"

const gasAPI = "https://gasprice.poa.network/"

interface GasResponse {
  standard: number
  fast: number
  instant: number
  health: boolean
}

export default async function fetchGasPrices(
  dispatch: AppDispatch,
): Promise<void> {
  await retry(
    () =>
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
        }),
    {
      retries: 3,
    },
  )
}
