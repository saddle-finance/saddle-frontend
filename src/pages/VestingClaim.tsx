import { Box, Button, IconButton, Link, Typography } from "@mui/material"
import React, { ReactElement, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { commify, formatBNToString, getContract } from "../utils"
import { enqueuePromiseToast, enqueueToast } from "../components/Toastify"

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import { BigNumber } from "@ethersproject/bignumber"
import INVESTOR_EMPLOYEE_VESTING_CONTRACT_ABI from "../constants/abis/vesting.json"
import { SDL_TOKEN } from "../constants"
import { Vesting } from "../../types/ethers-contracts/Vesting"
import { Zero } from "@ethersproject/constants"
import logo from "../assets/icons/logo.svg"
import { useActiveWeb3React } from "../hooks"
import useAddTokenToMetamask from "../hooks/useAddTokenToMetamask"
import { useSdlContract } from "../hooks/useContract"

function VestingClaim(): ReactElement {
  const { t } = useTranslation()
  const { account, chainId, library } = useActiveWeb3React()
  const { addToken, canAdd } = useAddTokenToMetamask({
    ...SDL_TOKEN,
  })
  const sdlContract = useSdlContract()

  const [isValidBeneficiary, setIsValidBeneficiary] = useState(false)
  const [claimableVestedAmount, setClaimableVestedAmount] = useState(Zero)
  const [remainingAmount, setRemainingAmount] = useState(Zero)
  const [vestingContract, setVestingContract] = useState<Vesting>()

  const formatAmount = (amount: BigNumber): string =>
    commify(formatBNToString(amount, 18, 2))

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      if (!library || !chainId || !account || !sdlContract) return
      const vestingContractDeployedFilter =
        sdlContract.filters.VestingContractDeployed(null, null)
      try {
        const events = await sdlContract.queryFilter(
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
            const remainingAmount = await sdlContract.balanceOf(
              vestingContract.address,
            )
            setRemainingAmount(remainingAmount)
          } catch (err) {
            console.error(err)
            enqueueToast("error", "Unable to get total pending amount")
          }
          try {
            const claimableVestedAmount = await vestingContract.vestedAmount()
            setClaimableVestedAmount(claimableVestedAmount)
          } catch (err) {
            console.error(err)
            enqueueToast("error", "Unable to get vested amount")
          }
        }
      } catch (err) {
        console.error(err)
        enqueueToast("error", "Unable to query for vesting contracts")
      }
    }
    void fetchBeneficiaries()
  }, [account, chainId, library, sdlContract])

  const onClaimClick: () => Promise<void> = async () => {
    if (!vestingContract || !chainId) return
    try {
      const txn = await vestingContract.release()
      await enqueuePromiseToast(chainId, txn.wait(), "claim", {
        poolName: "Vesting Contract",
      })
      setClaimableVestedAmount(Zero)
    } catch (err) {
      console.error(err)
      enqueueToast("error", "Unable to claim vested tokens")
    }
  }

  return (
    <div>
      <Box
        py={5}
        sx={{
          backgroundImage: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(7,7,19,1) 25%, rgba(18,19,52,1) 50%,rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%)"
              : `linear-gradient(180deg, #FFF 25%, #FAF3CE 50%,#FFF 50%, #FFF 100%)`,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={170}
          height={170}
          borderRadius="50%"
          marginX="auto"
          boxShadow="0px 4px 20px rgba(255, 255, 255, 0.25)"
          sx={{
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(0deg, #000 0%, #341291 100%)"
                : "linear-gradient(180deg, #FFF 0%, #FBF4CF 100%)",
          }}
        >
          <img src={logo} width={138} height={138} />
        </Box>
      </Box>

      <Box textAlign="center">
        {isValidBeneficiary ? (
          <>
            <Box display="flex" justifyContent="center" alignItems="center">
              <div>
                <Typography variant="subtitle1">
                  {t("investorClaimAmount", {
                    claimable: formatAmount(claimableVestedAmount),
                  })}
                </Typography>
                <Typography variant="subtitle1">
                  {t("investorRemainingAmount", {
                    remaining: formatAmount(remainingAmount),
                  })}
                </Typography>
              </div>
              {canAdd && (
                <IconButton
                  style={{ width: 16, marginBottom: 3, marginLeft: 32 }}
                  onClick={() => addToken()}
                >
                  <AddCircleOutlineIcon color="primary" />
                </IconButton>
              )}
            </Box>

            <Typography my={3}>
              {t("vestingContract")}{" "}
              <Link
                href={`https://etherscan.io/address/${
                  vestingContract?.address ?? ""
                }`}
              >
                {vestingContract?.address}
              </Link>
            </Typography>
          </>
        ) : (
          <Typography>{t("switchToBeneficiaryAddress")}</Typography>
        )}

        <Typography mb={3}>
          <Trans i18nKey="saddleTokenInfo" t={t}>
            SDL token is launched by Saddle Finance. Read more about token
            distribution{" "}
            <Link
              href="https://blog.saddle.finance/introducing-sdl"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline" }}
            >
              here
            </Link>
          </Trans>
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => void onClaimClick()}
          disabled={
            !isValidBeneficiary ||
            Number(formatAmount(claimableVestedAmount)) === 0
          }
          sx={{ minWidth: 176 }}
        >
          {t("claim")}
        </Button>
      </Box>
    </div>
  )
}

export default VestingClaim
