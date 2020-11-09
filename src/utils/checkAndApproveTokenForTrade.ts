import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { MaxUint256 } from "@ethersproject/constants"

/**
 * Checks if a spender is allowed to spend some amount of a token.
 * Approves them to spend if they're not already allowed.
 * Won't make requests if spendingValue eq 0
 *
 * @param {Contract} srcTokenContract
 * @param {string} swapAddress
 * @param {string} spenderAddress
 * @param {BigNumber} spendingValue
 * @param {boolean} infiniteApproval
 *
 */
export default async function checkAndApproveTokenForTrade(
  srcTokenContract: Contract | null,
  swapAddress: string,
  spenderAddress: string,
  spendingValue: BigNumber, // max is MaxUint256
  infiniteApproval = false,
): Promise<void> {
  // TODO(david) add invariant for addresses here
  if (srcTokenContract == null) return
  if (spendingValue.eq(0)) return
  const tokenName = await srcTokenContract.name()
  const existingAllowance = await srcTokenContract.allowance(
    spenderAddress,
    swapAddress,
  )
  console.debug(`Existing ${tokenName} Allowance: ${existingAllowance}`)

  if (existingAllowance.lt(spendingValue)) {
    if (existingAllowance.gt("0")) {
      // Reset to 0 before updating approval
      await srcTokenContract.approve(swapAddress, "0")
    }
    await srcTokenContract.approve(
      swapAddress,
      infiniteApproval ? MaxUint256 : spendingValue,
    )
    console.debug(`Approving ${tokenName} spend of ${spendingValue}`)
  }
  return
}
