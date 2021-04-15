import {
  BLOCK_TIME,
  DAI,
  RENBTC,
  SBTC,
  TBTC,
  USDC,
  USDT,
  VETH2,
  WBTC,
  WETH,
} from "../../constants"
import { Contract, Provider } from "ethcall"

import { BigNumber } from "@ethersproject/bignumber"
import { Call } from "ethcall/lib/call"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { IS_DEVELOPMENT } from "../../utils/environment"
import { getNetworkLibrary } from "../../connectors"
import { useActiveWeb3React } from "../../hooks"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId } = useActiveWeb3React()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  const ethcallProvider = new Provider()

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!chainId) return

      await ethcallProvider.init(getNetworkLibrary())
      // override the contract address when using hardhat
      if (IS_DEVELOPMENT) {
        ethcallProvider.multicallAddress =
          "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
      }

      const balanceCalls: Call[] = [
        new Contract(TBTC.addresses[chainId], ERC20_ABI),
        new Contract(WBTC.addresses[chainId], ERC20_ABI),
        new Contract(RENBTC.addresses[chainId], ERC20_ABI),
        new Contract(SBTC.addresses[chainId], ERC20_ABI),
        new Contract(DAI.addresses[chainId], ERC20_ABI),
        new Contract(USDC.addresses[chainId], ERC20_ABI),
        new Contract(USDT.addresses[chainId], ERC20_ABI),
        new Contract(WETH.addresses[chainId], ERC20_ABI),
        new Contract(VETH2.addresses[chainId], ERC20_ABI),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ].map((c): Call => c.balanceOf(account) as Call)
      const balances: BigNumber[] = (await ethcallProvider.all(
        balanceCalls,
        {},
      )) as BigNumber[]

      setBalances({
        [TBTC.symbol]: balances[0],
        [WBTC.symbol]: balances[1],
        [RENBTC.symbol]: balances[2],
        [SBTC.symbol]: balances[3],
        [DAI.symbol]: balances[4],
        [USDC.symbol]: balances[5],
        [USDT.symbol]: balances[6],
        [WETH.symbol]: balances[7],
        [VETH2.symbol]: balances[8],
      })
    }
    if (account) {
      void pollBalances()
    }
  }, BLOCK_TIME)

  return balances
}
