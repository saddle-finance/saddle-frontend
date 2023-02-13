import { AppDispatch } from "../state"
import { BN_1E18 } from "./../constants/index"
import { BigNumber } from "ethers"
import { ChainId } from "../constants/networks"
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
      if (chainId === ChainId.HARDHAT) {
        dispatch(
          updateSdlWethSushiPool({
            totalSupply: BigNumber.from(10).mul(BN_1E18),
            wethReserve: BigNumber.from(10).mul(BN_1E18),
            sdlReserve: BigNumber.from(55000).mul(BN_1E18),
          }),
        )
        return
      } else {
        console.error(e)
        dispatch(updateSdlWethSushiPool(null))
      }
    })
}
