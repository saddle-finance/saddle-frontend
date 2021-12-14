import { Contract as EthersContract, ethers } from "ethers"
import React, { ReactElement, useEffect, useState } from "react"
import { SDL_TOKEN, SDL_TOKEN_ADDRESSES } from "../constants"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString } from "../utils"
import { notifyCustomError, notifyHandler } from "../utils/notifyHandler"
import Button from "../components/Button"
import INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI from "../constants/abis/vesting.json"
import SDL_TOKEN_ABI from "../constants/abis/sdl.json"
import { Sdl } from "../../types/ethers-contracts/Sdl"
import TopMenu from "../components/TopMenu"
import { Vesting } from "../../types/ethers-contracts/Vesting"
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

  const [isValidBene, setIsValidBene] = useState(false)
  const [claimableVestedAmount, setClaimableVestedAmount] = useState("0.0")
  const [remainingAmount, setRemainingAmount] = useState("0.0")
  const [vestingContract, setVestingContract] = useState<Vesting>()

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!library || !chainId) return
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as never,
      )
      const SDLContract = new EthersContract(
        SDL_TOKEN_ADDRESSES[chainId],
        SDL_TOKEN_ABI,
        provider.getSigner(),
      ) as Sdl
      const vestingContractDeployedFilter = SDLContract.filters.VestingContractDeployed(
        null,
        null,
      )
      try {
        const events = await SDLContract.queryFilter(
          vestingContractDeployedFilter,
        )
        const currentBeneficiary = events.filter(
          (event) => event.args?.beneficiary === account,
        )
        setIsValidBene(currentBeneficiary.length > 0)
        if (isValidBene) {
          const vestingContract = new EthersContract(
            currentBeneficiary[0].args?.vestingContract,
            INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI,
            provider.getSigner(),
          ) as Vesting
          setVestingContract(vestingContract)
          try {
            const remainingAmount = commify(
              formatBNToString(
                await SDLContract.balanceOf(vestingContract.address),
                18,
                2,
              ),
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
            const claimableVestedAmount = commify(
              formatBNToString(await vestingContract.vestedAmount(), 18, 2),
            )
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
  }, [account, chainId, library, isValidBene])

  const onClaimClick: () => void = async () => {
    if (!vestingContract) return
    try {
      const txn = await vestingContract.release()
      notifyHandler(txn?.hash, "claim")
      await txn?.wait()
      setClaimableVestedAmount("0.0")
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
      <TopMenu activeTab={t("risk")} />
      <div className={styles.container}>
        <div className={styles.gradient}></div>
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>
            <img src={logo} />
          </div>
        </div>
        <div className={styles.mainContent}>
          {isValidBene ? (
            <>
              <div className={styles.tokenBalance}>
                {claimableVestedAmount} of {remainingAmount} remaining tokens
                {canAdd && (
                  <img
                    src={plusIcon}
                    className={styles.plus}
                    onClick={() => addToken()}
                  />
                )}
              </div>
              <div className={styles.tokenBalanceHelpText}>
                {t("totalClaimableSDL")}
              </div>
              <div className={styles.tokenBalanceHelpText}>
                Vesting Contract:{" "}
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
            <div className={styles.info}>
              Please switch to your beneficiary address
            </div>
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
              disabled={!isValidBene || Number(claimableVestedAmount) === 0}
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
