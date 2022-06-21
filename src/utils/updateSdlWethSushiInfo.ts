import { AppDispatch } from "../state"
import { ChainId } from "../constants"
import { SushiPool } from "./../../types/ethers-contracts/SushiPool.d"
import { areGaugesActive } from "./gauges"
import { updateSdlWethSushiPool } from "../state/application"

export default function fetchSdlWethSushiPoolInfo(
  dispatch: AppDispatch,
  poolContract: SushiPool | null,
  chainId?: ChainId,
): void {
  const gaugesAreActive = areGaugesActive(chainId)
  if (!poolContract || !gaugesAreActive) {
    dispatch(updateSdlWethSushiPool(null))
    return
  }
  void Promise.all([poolContract.totalSupply(), poolContract.getReserves()])
    .then(([totalSupply, reserves]) => {
      // Weth is 0, Sdl is 1
      dispatch(
        updateSdlWethSushiPool({
          totalSupply,
          wethReserve: reserves[0],
          sdlReserve: reserves[1],
        }),
      )
    })
    .catch((e) => {
      console.error(e)
      dispatch(updateSdlWethSushiPool(null))
    })
}
