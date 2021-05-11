import { BLOCK_TIME, ChainId, TOKENS_MAP } from "../../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../../types/ethcall"

import { BigNumber } from "@ethersproject/bignumber"
import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts/Erc20"
import { useActiveWeb3React } from "../../hooks"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId, library } = useActiveWeb3React()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!library || !chainId || !account) return

      await ethcallProvider.init(library)
      // override the contract address when using hardhat
      if (chainId == ChainId.HARDHAT) {
        ethcallProvider.multicallAddress =
          "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
      }

      const tokens = Object.values(TOKENS_MAP)
      const balanceCalls = tokens
        .map((t) => {
          return new Contract(
            t.addresses[chainId],
            ERC20_ABI,
          ) as MulticallContract<Erc20>
        })
        .map((c) => c.balanceOf(account))
      const balances = await ethcallProvider.all(balanceCalls, {})

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
