import { BigNumber } from "@ethersproject/bignumber"
import { ContractReceipt } from "ethers"
import { ContractTransaction } from "@ethersproject/contracts"
import { Erc20 } from "../../types/ethers-contracts/Erc20"
import { LpTokenGuarded } from "../../types/ethers-contracts/LpTokenGuarded"
import { LpTokenUnguarded } from "../../types/ethers-contracts/LpTokenUnguarded"
import { MaxUint256 } from "@ethersproject/constants"
import Notify from "bnc-notify"
import { Zero } from "@ethersproject/constants"
import { getEtherscanLink } from "../utils/getEtherscanLink"

/**
 * Checks if a spender is allowed to spend some amount of a token.
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
  srcTokenContract: Erc20 | LpTokenGuarded | LpTokenUnguarded,
  swapAddress: string,
  spenderAddress: string,
  spendingValue: BigNumber, // max is MaxUint256
  infiniteApproval = false,
  callbacks: {
    onTransactionStart?: (
      transaction?: ContractTransaction,
    ) => (() => void) | undefined
    onTransactionSuccess?: (transaction: ContractReceipt) => () => void
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
  const notify = Notify({
    dappId: "3f1ffee0-a39b-4f4e-8371-f0e157e4172e",
    networkId: 1,
  })

  console.debug(
    `Existing ${tokenName} Allowance: ${existingAllowance.toString()}`,
  )
  if (existingAllowance.gte(spendingValue)) return
  async function approve(amount: BigNumber): Promise<void> {
    try {
      const cleanupOnStart = callbacks.onTransactionStart?.()
      const approvalTransaction = await srcTokenContract.approve(
        swapAddress,
        amount,
      )

      const { emitter } = notify.hash(approvalTransaction.hash)

      emitter.on("txPool", (transaction) => {
        console.log("txn: ")
        console.log(transaction)
        console.log(`\n hash:`)
        console.log(transaction.hash)
        return {
          message: `Your transaction is pending, click for more info.`,
          onclick: () => {
            if (transaction.hash) {
              window.open(getEtherscanLink(transaction.hash, "tx"))
            }
          },
        }
      })
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
    await approve(Zero)
  }
  await approve(infiniteApproval ? MaxUint256 : spendingValue)
  console.debug(`Approving ${tokenName} spend of ${spendingValue.toString()}`)
}
