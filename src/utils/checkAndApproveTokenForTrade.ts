import { Contract, ContractTransaction } from "@ethersproject/contracts"

import { BigNumber } from "@ethersproject/bignumber"
import { MaxUint256 } from "@ethersproject/constants"

/**
 *  Checks if a spender is allowed to spend some amount of a token.
 * Approves them to spend if they're not already allowed.
 * Won't make requests if spendingValue eq 0
 * @param {Contract} srcTokenContract
 * @param {string} swapAddress
 * @param {string} spenderAddress
 * @param {BigNumber} spendingValue
 * @param {boolean} infiniteApproval
 * @param {{}} callbacks
 * @return {Promise<void>}
 */
export default async function checkAndApproveTokenForTrade(
  srcTokenContract: Contract,
  swapAddress: string,
  spenderAddress: string,
  spendingValue: BigNumber, // max is MaxUint256
  infiniteApproval = false,
  callbacks: {
    onTransactionStart?: (
      transaction?: ContractTransaction,
    ) => (() => void) | undefined
    onTransactionSuccess?: (transaction: ContractTransaction) => () => void
    onTransactionError?: (error: Error | string) => () => void
  } = {},
): Promise<void> {
  if (srcTokenContract == null) return
  if (spendingValue.eq(0)) return
  const tokenName = await srcTokenContract.name()
  const existingAllowance = await srcTokenContract.allowance(
    spenderAddress,
    swapAddress,
  )
  console.debug(`Existing ${tokenName} Allowance: ${existingAllowance}`)
  if (existingAllowance.gte(spendingValue)) return
  async function approve(amount: BigNumber): Promise<void> {
    try {
      const cleanupOnStart = callbacks.onTransactionStart?.()
      const approvalTransaction = await srcTokenContract.approve(
        swapAddress,
        amount,
      )
      const confirmedTransaction = await approvalTransaction.wait()
      cleanupOnStart?.()
      callbacks.onTransactionSuccess?.(confirmedTransaction)
    } catch (error) {
      callbacks.onTransactionError?.(error)
      throw error
    }
  }
  if (existingAllowance.gt("0")) {
    // Reset to 0 before updating approval
    await approve(BigNumber.from(0))
  }
  await approve(infiniteApproval ? MaxUint256 : spendingValue)
  console.debug(`Approving ${tokenName} spend of ${spendingValue}`)
}
