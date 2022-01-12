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
      const vestingContractDeployedFilter =
        SDLContract.filters.VestingContractDeployed(null, null)
      try {
        const events = await SDLContract.queryFilter(
          vestingContractDeployedFilter,
        )
        const currentBeneficiaryEvents = events.filter(
          (event) => event.args?.beneficiary === account,
        )
        const nonCapturedBeneficiaryAddresses: {
          [beneficiaryAddress: string]: string
        } = {
          "0x3F8E527aF4e0c6e763e8f368AC679c44C45626aE":
            "0x5DFbCeea7A5F6556356C7A66d2A43332755D68A5",
          "0xCB11d6C568448cAbEC62C2c3469b538Eb37E1341":
            "0xB960FaFEBb589ca3500Eb9350Eea503548bCcFC2",
          "0xEC6f7607cD7E4C942a75d40C269deC01BBc9A15e":
            "0x597e475a5ddd90b3eb2135ac47319bd866f685d8",
          "0x53ab66E5bAb196CF86F65feD79981cb85470200e":
            "0x5c85B43468da23F86016f508f14cA927bfD8A737",
          "0x17f61d0F9701A7fB5814C2d4AD3dC3831e07b277":
            "0x41092b4ecf2c4db719ec5ab67dbd0c66f095ee97",
        }
        const isValidBeneficiary =
          currentBeneficiaryEvents.length > 0 ||
          Boolean(nonCapturedBeneficiaryAddresses[account])
        setIsValidBeneficiary(isValidBeneficiary)
        if (isValidBeneficiary) {
          const vestingContractAddress =
            nonCapturedBeneficiaryAddresses[account] ||
            currentBeneficiaryEvents[0].args?.vestingContract
          const vestingContract = getContract(
            vestingContractAddress,
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
