export interface Swap {
  name: string
  address?: string
  lpToken: Token
  pooledTokens: Token[]
}

export interface Token {
  name: string
  symbol: string
  decimals: number
  address?: string
}
