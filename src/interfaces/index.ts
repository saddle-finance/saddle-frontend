import { BigNumber } from "@ethersproject/bignumber"
import { Token } from "../constants"

/** TRANSACTIONS */
export interface TransactionItem {
  token: Token
  amount: BigNumber
  singleTokenPriceUSD: BigNumber
  totalValueUSD: BigNumber // amount * singleTokenPriceUSD / token.decimals
}

export interface BaseTransaction {
  from: TransactionItem | TransactionItem[]
  to: TransactionItem | TransactionItem[]
  priceImpact: BigNumber
}

export interface DepositTransaction extends BaseTransaction {
  from: TransactionItem[]
  to: TransactionItem
  shareOfPool: BigNumber
}

export interface WithdrawTransaction extends BaseTransaction {
  from: TransactionItem
  to: TransactionItem[]
}

export interface SwapTransaction extends BaseTransaction {
  from: TransactionItem
  to: TransactionItem
  exchangeRate: BigNumber
}
/** TRANSACTIONS END */
