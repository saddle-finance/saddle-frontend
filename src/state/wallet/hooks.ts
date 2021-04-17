import { BLOCK_TIME, TOKENS_MAP } from "../../constants"
import { Contract, Provider } from "ethcall"

import { BigNumber } from "@ethersproject/bignumber"
import { Call } from "ethcall/lib/call"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { IS_DEVELOPMENT } from "../../utils/environment"
import { useActiveWeb3React } from "../../hooks"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId, library } = useActiveWeb3React()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  const ethcallProvider = new Provider()

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!library || !chainId) return

      await ethcallProvider.init(library)
      // override the contract address when using hardhat
      if (IS_DEVELOPMENT) {
        ethcallProvider.multicallAddress =
          "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
      }

      const tokens = Object.values(TOKENS_MAP)
      const balanceCalls = tokens
        .map((t) => new Contract(t.addresses[chainId], ERC20_ABI))
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        .map((c): Call => c.balanceOf(account) as Call)
      const balances = (await ethcallProvider.all(
        balanceCalls,
        {},
      )) as BigNumber[]

      setBalances(
        tokens.reduce(
          (acc, t, i) => ({
            ...acc,
            [t.symbol]: balances[i],
          }),
          {},
        ),
      )
    }
    if (account) {
      void pollBalances()
    }
  }, BLOCK_TIME)

  return balances
}
