import React, { ReactElement, useEffect, useState } from "react"
import { SDL_TOKEN, SDL_TOKEN_ADDRESSES } from "../constants"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString, getContract } from "../utils"
import { notifyCustomError, notifyHandler } from "../utils/notifyHandler"
import { BigNumber } from "@ethersproject/bignumber"
import Button from "../components/Button"
import INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI from "../constants/abis/vesting.json"
import SDL_TOKEN_ABI from "../constants/abis/sdl.json"
import { Sdl } from "../../types/ethers-contracts/Sdl"
import { Vesting } from "../../types/ethers-contracts/Vesting"
import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import plusIcon from "../assets/icons/plus.svg"
import styles from "../components/TokenClaimModal.module.scss"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"

function VestingClaim(): ReactElement {
  const { t } = useTranslation()
  const { account, chainId, library } = useActiveWeb3React()
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
    icon: `${window.location.origin}/logo.svg`,
  })

  const [isValidBeneficiary, setIsValidBeneficiary] = useState(false)
  const [claimableVestedAmount, setClaimableVestedAmount] = useState(Zero)
  const [remainingAmount, setRemainingAmount] = useState(Zero)
  const [vestingContract, setVestingContract] = useState<Vesting>()

  const formatAmount = (amount: BigNumber): string =>
    commify(formatBNToString(amount, 18, 2))

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!library || !chainId || !account) return
      const SDLContract = getContract(
        SDL_TOKEN_ADDRESSES[chainId],
        SDL_TOKEN_ABI,
        library,
        account,
      ) as Sdl
      const vestingContractDeployedFilter = SDLContract.filters.VestingContractDeployed(
        null,
        null,
      )
      try {
        const events = await SDLContract.queryFilter(
          vestingContractDeployedFilter,
        )
        const currentBeneficiaryEvents = events.filter(
          (event) => event.args?.beneficiary === account,
        )
        const isValidBeneficiary = currentBeneficiaryEvents.length > 0
        setIsValidBeneficiary(isValidBeneficiary)
        if (isValidBeneficiary) {
          const vestingContract = getContract(
            currentBeneficiaryEvents[0].args?.vestingContract,
            INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI,
            library,
            account,
          ) as Vesting
          setVestingContract(vestingContract)
          try {
            const remainingAmount = await SDLContract.balanceOf(
              vestingContract.address,
            )
            setRemainingAmount(remainingAmount)
          } catch (err) {
            console.error(err)
            notifyCustomError({
              ...(err as Error),
              message: "Unable to get total pending amount",
            })
          }
          try {
            const claimableVestedAmount = await vestingContract.vestedAmount()
            setClaimableVestedAmount(claimableVestedAmount)
          } catch (err) {
            console.error(err)
            notifyCustomError({
              ...(err as Error),
              message: "Unable to get vested amount",
            })
          }
        }
      } catch (err) {
        console.error(err)
        notifyCustomError({
          ...(err as Error),
          message: "Unable to query for vesting contracts",
        })
      }
    }
    void fetchBeneficiaries()
  }, [account, chainId, library])

  const onClaimClick: () => void = async () => {
    if (!vestingContract) return
    try {
      const txn = await vestingContract.release()
      notifyHandler(txn?.hash, "claim")
      await txn?.wait()
      setClaimableVestedAmount(Zero)
    } catch (err) {
      console.error(err)
      notifyCustomError({
        ...(err as Error),
        message: "Unable to claim vested tokens",
      })
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.gradient}></div>
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>
            <img src={logo} />
          </div>
        </div>
        <div className={styles.mainContent}>
          {isValidBeneficiary ? (
            <>
              <div className={styles.amountContainer}>
                <div>
                  <div>
                    {t("investorClaimAmount", {
                      claimable: formatAmount(claimableVestedAmount),
                    })}
                  </div>
                  <div>
                    {t("investorRemainingAmount", {
                      remaining: formatAmount(remainingAmount),
                    })}
                  </div>
                </div>
                {canAdd && (
                  <img
                    src={plusIcon}
                    className={styles.plus}
                    style={{ width: 16, marginBottom: 3, marginLeft: 32 }}
                    onClick={() => addToken()}
                  />
                )}
              </div>
              <div className={styles.tokenBalanceHelpText}>
                {t("vestingContract")}{" "}
                <a
                  href={`https://etherscan.io/address/${
                    vestingContract?.address ?? ""
                  }`}
                >
                  {vestingContract?.address}
                </a>
              </div>
            </>
          ) : (
            <div className={styles.info}>{t("switchToBeneficiaryAddress")}</div>
          )}

          <div className={styles.info}>
            <span>
              <Trans i18nKey="saddleTokenInfo" t={t}>
                SDL token is launched by Saddle Finance. Read more about token
                distribution{" "}
                <a
                  href="https://blog.saddle.finance/introducing-sdl"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  here
                </a>
              </Trans>
            </span>
          </div>
          {
            <Button
              onClick={onClaimClick}
              disabled={
                !isValidBeneficiary ||
                Number(formatAmount(claimableVestedAmount)) === 0
              }
            >
              {t("claim")}
            </Button>
          }
        </div>
      </div>
    </>
  )
}

export default VestingClaim
