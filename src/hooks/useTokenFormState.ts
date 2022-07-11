import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import React, { useCallback, useMemo } from "react"

import { BasicToken } from "../providers/TokensProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { Zero } from "@ethersproject/constants"

export interface TokensStateType {
  [token: string]: NumberInputState
}
type UpdateTokensStateType = (newState: {
  [token: string]: string | BigNumber
}) => void
type UseTokenFormStateReturnType = [TokensStateType, UpdateTokensStateType]

export function useTokenFormState(
  tokens: (BasicToken | undefined)[],
): UseTokenFormStateReturnType {
  // Token input state handlers
  const tokenInputStateCreators: {
    [tokenSymbol: string]: ReturnType<typeof numberInputStateCreator>
  } = useMemo(
    () =>
      tokens.reduce(
        (acc, token) => ({
          ...acc,
          [token?.symbol ?? ""]: numberInputStateCreator(
            token?.decimals ?? 0,
            Zero,
          ),
        }),
        {},
      ),
    [tokens],
  )

  // Token input values, both "raw" and formatted "safe" BigNumbers
  const [tokenFormState, setTokenFormState] = React.useState<TokensStateType>(
    tokens.reduce(
      (acc, token) => ({
        ...acc,
        [token?.symbol ?? ""]: tokenInputStateCreators[token?.symbol ?? ""](""),
      }),
      {},
    ),
  )

  // function updateTokenFormValue(tokenSymbol: string, value: string): void {
  //   setTokenFormState((prevState) => ({
  //     ...prevState,
  //     [tokenSymbol]: tokenInputStateCreators[tokenSymbol](value),
  //   }))
  // }
  const updateTokenFormState = useCallback(
    (newState: { [symbol: string]: string | BigNumber }) => {
      const convertedNewState = Object.keys(newState).reduce((acc, symbol) => {
        console.log({ symbol, newState, tokenInputStateCreators })
        return {
          ...acc,
          [symbol]: tokenInputStateCreators[symbol](newState[symbol]),
        }
      }, {})
      setTokenFormState((prevState) => ({
        ...prevState,
        ...convertedNewState,
      }))
    },
    [tokenInputStateCreators],
  )

  return [tokenFormState, updateTokenFormState]
}
