import { BigNumber } from "@ethersproject/bignumber"
import { Token } from "../constants"

/** TRANSACTIONS */
export interface TransactionItem {
  token: Token
  amount: BigNumber
  singleTokenPriceUSD: BigNumber
  valueUSD: BigNumber // amount * singleTokenPriceUSD / token.decimals
}

type SingleItem = { item: TransactionItem }

type MultipleItems = { items: TransactionItem[] }

type _BaseTransactionDirection = {
  totalAmount: BigNumber
  totalValueUSD: BigNumber
} & (SingleItem | MultipleItems)

interface _BaseTransaction {
  from: _BaseTransactionDirection
  to: _BaseTransactionDirection
  priceImpact: BigNumber
}

export interface DepositTransaction extends _BaseTransaction {
  from: {
    items: TransactionItem[]
    totalAmount: BigNumber
    totalValueUSD: BigNumber
  }
  to: {
    item: TransactionItem
    totalAmount: BigNumber
    totalValueUSD: BigNumber
  }
  shareOfPool: BigNumber
}

export interface WithdrawTransaction extends _BaseTransaction {
  from: {
    item: TransactionItem
    totalAmount: BigNumber
    totalValueUSD: BigNumber
  }
  to: {
    items: TransactionItem[]
    totalAmount: BigNumber
    totalValueUSD: BigNumber
  }
  shareOfPool: BigNumber
}

export interface SwapTransaction extends _BaseTransaction {
  from: {
    item: TransactionItem
    totalAmount: BigNumber
    totalValueUSD: BigNumber
  }
  to: {
    item: TransactionItem
    totalAmount: BigNumber
    totalValueUSD: BigNumber
  }
  shareOfPool: BigNumber
  exchangeRate: BigNumber
}
/** TRANSACTIONS END */
