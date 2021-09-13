import { BLOCK_TIME, TOKENS_MAP } from "../../constants"

import { BigNumber } from "@ethersproject/bignumber"

import { useActiveWeb3React } from "../../hooks"
import { useAllContracts } from "../../hooks/useContract"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId, library } = useActiveWeb3React()
  const allContracts = useAllContracts()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!library || !chainId || !account || !allContracts) return

      // override the contract address when using hardhat
      // if (chainId == ChainId.HARDHAT) {
      //   ethcallProvider.multicallAddress =
      //     "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
      // } else if (chainId == ChainId.ROPSTEN) {
      //   ethcallProvider.multicallAddress =
      //     "0x53c43764255c17bd724f74c4ef150724ac50a3ed"
      // }

      const tokens = Object.values(TOKENS_MAP)

      const balances = await Promise.all(
        tokens.map(async (t) => {
          return await allContracts[t.symbol]?.balanceOf(account)
        }),
      )

      const ethBalance = await library.getBalance(account)
      setBalances(
        tokens.reduce(
          (acc, t, i) => ({
            ...acc,
            [t.symbol]: balances[i],
          }),
          { ETH: ethBalance },
        ),
      )
    }
    if (account) {
      void pollBalances()
    }
  }, BLOCK_TIME)

  return balances
}
