import { BLOCK_TIME, TOKENS_MAP } from "../../constants"

import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "ethcall"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import { MulticallContract } from "../../types/ethcall"
import { getMulticallProvider } from "../../utils"
import { useActiveWeb3React } from "../../hooks"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId, library } = useActiveWeb3React()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!library || !chainId || !account) return

      const ethcallProvider = await getMulticallProvider(library, chainId)
      const tokens = Object.values(TOKENS_MAP).filter(
        ({ addresses }) => addresses[chainId],
      )
      const balanceCalls = tokens
        .map((t) => {
          return new Contract(
            t.addresses[chainId],
            ERC20_ABI,
          ) as MulticallContract<Erc20>
        })
        .map((c) => c.balanceOf(account))
      const balances = await ethcallProvider.tryEach(
        balanceCalls,
        balanceCalls.map(() => false),
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
