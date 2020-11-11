import {
  NumberInputState,
  numberInputStateCreator,
} from "../utils/numberInputState"

import { BigNumber } from "@ethersproject/bignumber"
import React from "react"
import { Token } from "../constants"

interface TokensStateType {
  [key: string]: NumberInputState
}
type UpdateTokenStateFnType = (tokenSymbol: string, value: string) => void
type UseTokenFormStateReturnType = [
  TokensStateType,
  UpdateTokenStateFnType
]

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
        [token.symbol]: tokenInputStateCreators[token.symbol]("0"),
      }),
      {},
    ),
  )

  function updateTokenFormValue(tokenSymbol: string, value: string): void {
    setTokenFormState((prevState) => ({
      ...prevState,
      [tokenSymbol]: tokenInputStateCreators[tokenSymbol](value),
    }))
  }

  return [tokenFormState, updateTokenFormValue]
}
