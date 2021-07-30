import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"
import React, { useCallback, useMemo } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import { Token } from "../constants"

export interface TokensStateType {
  [token: string]: NumberInputState
}
type UpdateTokensStateType = (newState: {
  [token: string]: string | BigNumber
}) => void
type UseTokenFormStateReturnType = [TokensStateType, UpdateTokensStateType]

export function useTokenFormState(
  tokens: Token[],
): UseTokenFormStateReturnType {
  // Token input state handlers
  const tokenInputStateCreators: {
    [tokenSymbol: string]: ReturnType<typeof numberInputStateCreator>
  } = useMemo(
    () =>
      tokens.reduce(
        (acc, token) => ({
          ...acc,
          [token.symbol]: numberInputStateCreator(
            token.decimals,
            BigNumber.from("0"),
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
        [token.symbol]: tokenInputStateCreators[token.symbol](""),
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
      const convertedNewState = Object.keys(newState).reduce(
        (acc, symbol) => ({
          ...acc,
          [symbol]: tokenInputStateCreators[symbol](newState[symbol]),
        }),
        {},
      )
      setTokenFormState((prevState) => ({
        ...prevState,
        ...convertedNewState,
      }))
    },
    [tokenInputStateCreators],
  )

  return [tokenFormState, updateTokenFormState]
}
