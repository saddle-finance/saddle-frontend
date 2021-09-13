import { AppDispatch } from "../state"
import retry from "async-retry"
import { updateGasPrices } from "../state/application"

interface GenericGasReponse {
  gasStandard: number
  gasFast: number
  gasInstant: number
}
interface POAGasResponse {
  standard: number
  fast: number
  instant: number
  health: boolean
}

interface GasNowGasResponse {
  code: number
  data: {
    rapid: number
    fast: number
    standard: number
  }
}
const fetchGasPricePOA = (): Promise<GenericGasReponse> =>
  fetch("https://gasprice.poa.network/")
    .then((res) => res.json())
    .then((body: POAGasResponse) => {
      const { health } = body
      if (health) {
        return {
          gasStandard: 0,
          gasFast: 0,
          gasInstant: 0,
        }
      }
      throw new Error("Unable to fetch gas price from POA Network")
    })

const fetchGasPriceGasNow = (): Promise<GenericGasReponse> =>
  fetch("https://www.gasnow.org/api/v3/gas/price?utm_source=saddle")
    .then((res) => res.json())
    .then((body: GasNowGasResponse) => {
      const { code } = body
      if (code >= 200 && code < 300) {
        return {
          gasStandard: 0,
          gasFast: 0,
          gasInstant: 0,
        }
      } // 0.015 gwei
      throw new Error("Unable to fetch gas price from GasNow Network")
    })

export default async function fetchGasPrices(
  dispatch: AppDispatch,
): Promise<void> {
  const dispatchUpdate = (gasPrices: GenericGasReponse) => {
    dispatch(updateGasPrices(gasPrices))
  }
  await retry(
    () =>
      fetchGasPriceGasNow() // try gaspricenow first
        .then(dispatchUpdate)
        .catch(() => fetchGasPricePOA().then(dispatchUpdate)), // else fall back to poa before retrying
    {
      retries: 3,
    },
  )
}
