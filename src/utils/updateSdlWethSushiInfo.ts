import { AppDispatch } from "../state"
import { SushiPool } from "./../../types/ethers-contracts/SushiPool.d"
import { updateSdlWethSushiPool } from "../state/application"

export default function fetchSdlWethSushiPoolInfo(
  dispatch: AppDispatch,
  poolContract: SushiPool | null,
): void {
  if (!poolContract) {
    dispatch(updateSdlWethSushiPool(null))
    return
  }
  void Promise.all([
    poolContract.totalSupply(),
    poolContract.getReserves(),
  ]).then(([totalSupply, reserves]) => {
    // Weth is 0, Sdl is 1
    dispatch(
      updateSdlWethSushiPool({
        totalSupply,
        wethReserve: reserves[0],
        sdlReserve: reserves[1],
      }),
    )
  })
}
