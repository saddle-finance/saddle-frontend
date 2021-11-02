import { AppDispatch } from "../state"
import retry from "async-retry"
import { updateGasPrices } from "../state/application"

interface GenericGasReponse {
  gasStandard: number
  gasFast: number
  gasInstant: number
}
interface POAGasResponse {
  slow: number
  average: number
  fast: number
}

const fetchGasPricePOA = (): Promise<GenericGasReponse> =>
  fetch("https://blockscout.com/eth/mainnet/api/v1/gas-price-oracle")
    .then((res) => res.json())
    .then((body: POAGasResponse) => {
      const { slow: standard, average: fast, fast: instant } = body
      return {
        gasStandard: Math.round(standard),
        gasFast: Math.round(fast),
        gasInstant: Math.round(instant),
      }
      throw new Error("Unable to fetch gas price from POA Network")
    })

export default async function fetchGasPrices(
  dispatch: AppDispatch,
): Promise<void> {
  const dispatchUpdate = (gasPrices: GenericGasReponse) => {
    dispatch(updateGasPrices(gasPrices))
  }
  await retry(
    () =>
      fetchGasPricePOA()
        .then(dispatchUpdate)
        .catch(() => fetchGasPricePOA().then(dispatchUpdate)), // else fall back to poa before retrying
    {
      retries: 3,
    },
  )
}
