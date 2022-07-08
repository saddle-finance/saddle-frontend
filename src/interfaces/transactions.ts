import { BasicToken } from "../providers/TokensProvider"
import { BigNumber } from "@ethersproject/bignumber"
import { Token } from "../constants"

/** TRANSACTIONS */
// TODO: Delete after POOL_MAP removal
export interface TransactionItem {
  token: Token
  amount: BigNumber
  singleTokenPriceUSD: BigNumber
  valueUSD: BigNumber // amount * singleTokenPriceUSD / token.decimals
}

export interface TransactionBasicItem {
  token: BasicToken | undefined
  amount: BigNumber
  singleTokenPriceUSD: BigNumber
  valueUSD: BigNumber // amount * singleTokenPriceUSD / token.decimals
}

type AggregateValues = {
  totalAmount: BigNumber
  totalValueUSD: BigNumber
}

type SingleItem = { item: TransactionItem } & AggregateValues
type SingleBasicItem = { item: TransactionBasicItem } & AggregateValues

type MultipleItems = { items: TransactionItem[] } & AggregateValues
type MultipleBasicItems = { items: TransactionBasicItem[] } & AggregateValues

interface _BaseTransaction {
  from: SingleItem | MultipleItems
  to: SingleItem | MultipleItems
  priceImpact: BigNumber
  txnGasCost?: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
}

interface _BaseBasicTransaction {
  from: SingleBasicItem | MultipleBasicItems
  to: SingleBasicItem | MultipleBasicItems
  priceImpact: BigNumber
  txnGasCost?: {
    amount: BigNumber
    valueUSD: BigNumber | null // amount * ethPriceUSD
  }
}

export interface DepositTransaction extends _BaseTransaction {
  from: MultipleItems
  to: SingleItem
  shareOfPool: BigNumber
}

export interface DepositBasicTransaction extends _BaseBasicTransaction {
  from: MultipleBasicItems
  to: SingleBasicItem
  shareOfPool: BigNumber
}

export interface WithdrawTransaction extends _BaseTransaction {
  from: SingleItem
  to: MultipleItems
  shareOfPool: BigNumber
}

export interface SwapTransaction extends _BaseTransaction {
  from: SingleItem
  to: SingleItem
  exchangeRate: BigNumber
}
/** TRANSACTIONS END */
