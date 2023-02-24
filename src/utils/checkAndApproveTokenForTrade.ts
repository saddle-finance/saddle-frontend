import { BigNumber } from "@ethersproject/bignumber"
import { ChainId } from "../constants/networks"
import { GenericToken } from "../../types/ethers-contracts/GenericToken"
import { MaxUint256 } from "@ethersproject/constants"
import { Zero } from "@ethersproject/constants"
import { enqueuePromiseToast } from "../components/Toastify"

/**
 * Checks if a spender is allowed to spend some amount of a token.
 * Approves them to spend if they're not already allowed.
 * Won't make requests if spendingValue eq 0
 * @param {Contract} srcTokenContract
 * @param {string} spenderAddress
 * @param {string} ownerAddress
 * @param {BigNumber} spendingValue
 * @param {boolean} infiniteApproval
 * @param {{}} callbacks
 * @return {Promise<void>}
 */
export default async function checkAndApproveTokenForTrade(
  srcTokenContract: GenericToken,
  spenderAddress: string,
  ownerAddress: string,
  spendingValue: BigNumber, // max is MaxUint256
  infiniteApproval = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gasPrice?: BigNumber, // @dev unused
  callbacks: {
    onTransactionError?: (error: Error | string) => () => void
  } = {},
  chainId?: ChainId,
): Promise<void> {
  if (srcTokenContract == null) return
  if (spendingValue.eq(0)) return
  const tokenName = await srcTokenContract.name()
  const existingAllowance = await srcTokenContract.allowance(
    ownerAddress,
    spenderAddress,
  )

  console.debug(
    `Existing ${tokenName} Allowance: ${existingAllowance.toString()}`,
  )
  if (existingAllowance.gte(spendingValue)) return
  async function approve(amount: BigNumber): Promise<void> {
    try {
      const approvalTransaction = await srcTokenContract.approve(
        spenderAddress,
        amount,
      )
      const confirmedTransaction = approvalTransaction.wait()
      await enqueuePromiseToast(
        chainId || ChainId.MAINNET,
        confirmedTransaction,
        "tokenApproval",
        {
          tokenName,
        },
      )
    } catch (error) {
      callbacks.onTransactionError?.(error as Error)
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
