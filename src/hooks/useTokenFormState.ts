import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"

import { BigNumber } from "@ethersproject/bignumber"
import React from "react"
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
  } = tokens.reduce(
    (acc, token) => ({
      ...acc,
      [token.symbol]: numberInputStateCreator(
        token.decimals,
        BigNumber.from("0"),
      ),
    }),
    {},
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
  function updateTokenFormState(newState: {
    [symbol: string]: string | BigNumber
  }): void {
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
  }

  return [tokenFormState, updateTokenFormState]
}
