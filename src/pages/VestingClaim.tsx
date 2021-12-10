/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable sort-imports */
import React, { ReactElement, useContext, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString, getMulticallProvider } from "../utils"
import { Contract } from "ethcall"
import logo from "../assets/icons/logo.svg"
import plusIcon from "../assets/icons/plus.svg"
import Button from "../components/Button"
import styles from "../components/TokenClaimModal.module.scss"
import { SDL_TOKEN } from "../constants"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI from "../constants/abis/vesting.json"
import SDL_TOKEN_ABI from "../constants/abis/sdl.json"
import { RewardsBalancesContext } from "../providers/RewardsBalancesProvider"
import { useInvestorEmployeeVestingContract } from "../hooks/useContract"
import { useActiveWeb3React } from "../hooks"
import { vestingContractAddrs } from "../constants/vestingContractAddrs"
import { MulticallContract } from "../types/ethcall"
import { ethers, Contract as EthersContract } from "ethers"
import { Vesting } from "../../types/ethers-contracts/Vesting"

function VestingClaim(): ReactElement {
  const { t } = useTranslation()
  const { account, chainId, library } = useActiveWeb3React()
  const investorEmployeeVestingContract = useInvestorEmployeeVestingContract()
  const rewardBalances = useContext(RewardsBalancesContext)
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
    icon: `${window.location.origin}/logo.svg`,
  })

  const formattedUnclaimedTokenbalance = commify(
    formatBNToString(rewardBalances.total, 18, 0),
  )

  const isBeneficiaryAddress = false

  const [vestingContracts, setVestingContracts] = useState({})
  const [beneficiaries, setBeneficiaries] = useState([])

  useEffect(() => {
    const fetchVestingContracts = async () => {
      const vestingContractsRes: Response = await fetch(
        "https://gateway.pinata.cloud/ipfs/QmV73GEaijyiBFHu1vRdZBFffoCHaXYWG5SpurbEgr4VK6",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      )

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const vestingContracts = await vestingContractsRes.json()
      setVestingContracts(vestingContracts)
    }
    void fetchVestingContracts()
    console.log({ account, vestingContracts, investorEmployeeVestingContract })
  }, [])

  useEffect(() => {
    const fetchBeneficiaries = () => {
      if (!library || !chainId) return
      console.log({ library, chainId, window })
      // const ethcallProvider = await getMulticallProvider(library, chainId)
      const provider = new ethers.providers.Web3Provider(window.ethereum as any)
      console.log({ provider })
      const SDLContract = new EthersContract(
        "0x04C89607413713Ec9775E14b954286519d836FEf",
        SDL_TOKEN_ABI,
        provider.getSigner(),
      )
      console.log({ SDLContract })
      const filteredVestingContractDeployed = SDLContract.filters.VestingContractDeployed()
      // const beneficiariesCalls = vestingContractAddrs.map((addr) => {
      //   return new EthersContract(
      //     addr,
      //     INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI,
      //     provider.getSigner(),
      //   )
      // ) as MulticallContract<Vesting>
      // })
      // .map((contract) => {
      //   console.log({ contract, filters: contract.filters })
      //   const eventFilter = contract.filters.beneficiary()
      //   console.log({ eventFilter })
      //   return contract.beneficiary()
      // })
      // console.log({
      //   beneficiariesCalls,
      // })
      // const bRes = beneficiariesCalls[0].beneficiary()
      // console.log({ bRes })
      // const events = await beneficiariesCalls.queryFilter(eventFilter)
      // const beneficiaries = await ethcallProvider.all(beneficiariesCalls, {})
      // @ts-ignore
      // setBeneficiaries(beneficiaries)
    }
    void fetchBeneficiaries()
    console.log({ beneficiaries })
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.gradient}></div>
      <div className={styles.logoWrapper}>
        <div className={styles.logo}>
          <img src={logo} />
        </div>
      </div>
      <div className={styles.mainContent}>
        {isBeneficiaryAddress ? (
          <div className={styles.tokenBalance}>
            {formattedUnclaimedTokenbalance}
            {canAdd && (
              <img
                src={plusIcon}
                className={styles.plus}
                onClick={() => addToken()}
              />
            )}
          </div>
        ) : (
          <div className={styles.info}>
            Please switch to your beneficiary address
          </div>
        )}

        <div className={styles.tokenBalanceHelpText}>
          {t("totalClaimableSDL")}
        </div>
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
            onClick={() => investorEmployeeVestingContract?.release()}
            disabled={!isBeneficiaryAddress}
          >
            {t("claim")}
          </Button>
        }
      </div>
    </div>
  )
}

export default VestingClaim
