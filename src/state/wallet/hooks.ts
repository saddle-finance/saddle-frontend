import { BLOCK_TIME, ChainId, TOKENS_MAP } from "../../constants"
import { Contract, Provider } from "ethcall"
import { MulticallContract, MulticallProvider } from "../../types/ethcall"

import { BigNumber } from "@ethersproject/bignumber"

import ERC20_ABI from "../../constants/abis/erc20.json"
import { Erc20 } from "../../../types/ethers-contracts"
import { Zero } from "@ethersproject/constants"
import { useActiveWeb3React } from "../../hooks"
import { useAllContracts } from "../../hooks/useContract"
import usePoller from "../../hooks/usePoller"
import { useState } from "react"

export function usePoolTokenBalances(): { [token: string]: BigNumber } | null {
  const { account, chainId, library } = useActiveWeb3React()
  const contracts = useAllContracts()
  const [balances, setBalances] = useState<{ [token: string]: BigNumber }>({})

  const ethcallProvider = new Provider() as MulticallProvider

  usePoller((): void => {
    async function pollBalances(): Promise<void> {
      if (!library || !chainId || !account || !contracts) return

      const tokens = Object.values(TOKENS_MAP)
      const shouldUseMulticall = true

      let balances: { [p: string]: BigNumber }

      if (!shouldUseMulticall) {
        // Make direct calls when Multicall is not supported
        const promises = tokens.map(async (token) => {
          return {
            [token.symbol]: await contracts[token.symbol]?.balanceOf(account),
          }
        })
        const tokenBalanceArray = await Promise.all(promises)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        balances = Object.assign({ ETH: Zero }, ...tokenBalanceArray)
      } else {
        // If Multicall is supported, then batch all `balanceOf` calls
        await ethcallProvider.init(library)
        if (chainId == ChainId.HARDHAT) {
          ethcallProvider.multicallAddress =
            "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
        }
        const balanceCalls = tokens
          .map((t) => {
            return new Contract(
              t.addresses[chainId],
              ERC20_ABI,
            ) as MulticallContract<Erc20>
          })
          .map((c) => c.balanceOf(account))
        const tokenBalances = await ethcallProvider.all(balanceCalls, {})
        const ethBalance = await library.getBalance(account)

        balances = tokens.reduce(
          (acc, t, i) => ({
            ...acc,
            [t.symbol]: tokenBalances[i],
          }),
          { ETH: ethBalance },
        )
      }

      setBalances(balances)
    }
    if (account) {
      void pollBalances()
    }
  }, BLOCK_TIME)

  return balances
}
