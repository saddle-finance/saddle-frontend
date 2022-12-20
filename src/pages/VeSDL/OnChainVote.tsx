import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
import React, { useMemo, useState } from "react"
import { commify, formatBNToString, isNumberOrEmpty } from "../../utils"
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"

import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BigNumber } from "ethers"
import { GaugeController } from "../../../types/ethers-contracts/GaugeController"
import { LPTokenAddressToGauge } from "../../utils/gauges"
import VoteHistory from "./Votes"
import { useActiveWeb3React } from "../../hooks"
import { useQuery } from "@tanstack/react-query"
import { useSidechainGaugeWeightDataOnMainnet } from "../../hooks/useSidechainGaugeWeightDataOnMainnet"
import { useTranslation } from "react-i18next"

// export type LPTokenAddressToGauge = Partial<{
//   [lpTokenAddress: string]: Gauge
// }>

interface OnChainVoteProps {
  veSdlBalance: BigNumber
  gauges: LPTokenAddressToGauge
  gaugeControllerContract: GaugeController
}
export type GaugeName = {
  [gaugeAddress: string]: {
    address: string
    gaugeName: string
  }
}

export type VotesType = {
  [gaugeAddress: string]: {
    gaugeName: string
    weight: BigNumber
    voteDate: number
  }
}

export default function OnChainVote({
  veSdlBalance,
  gauges,
  gaugeControllerContract,
}: OnChainVoteProps) {
  const theme = useTheme()
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const { data: sidechainGaugesInfo } = useSidechainGaugeWeightDataOnMainnet()
  const [selectedGauge, setSelectedGauge] = useState<{
    gaugeName: string
    address: string
  } | null>(null)
  const [alertMessage, setAlertMessage] = useState<string>()
  const [voteWeightToSubmit, setVoteWeightToSubmit] = useState<string>("")
  const [voteWeightInputError, setVoteWeightInputError] = useState<{
    hasError: boolean
    errorText: string
  }>({ hasError: false, errorText: " " })

  const gaugeNames = useMemo(() => {
    const gaugeNameObj = {} as GaugeName
    Object.keys(gauges)
      .filter((lpTokenAddress) => !gauges[lpTokenAddress]?.isKilled)
      .forEach((lpTokenAddress) => {
        const gaugeName = gauges[lpTokenAddress]?.gaugeName
        const gaugeAddress = gauges[lpTokenAddress]?.address.toLowerCase()
        if (gaugeName && gaugeAddress)
          gaugeNameObj[gaugeAddress] = {
            address: gaugeAddress,
            gaugeName: gaugeName,
          }
      })
    ;(sidechainGaugesInfo?.gauges || []).forEach(({ address, displayName }) => {
      gaugeNameObj[address] = {
        address,
        gaugeName: displayName,
      }
    })
    return gaugeNameObj
  }, [gauges, sidechainGaugesInfo])

  const getVoteUsed = () => {
    if (!account) return
    return gaugeControllerContract["vote_user_power(address)"](account)
  }
  const getFilteredVotes = () => {
    const voteFilter = gaugeControllerContract.filters.VoteForGauge(
      null,
      null,
      null,
      null,
    )
    return gaugeControllerContract.queryFilter(voteFilter)
  }

  const { data: voteUsed } = useQuery(["voteUsed"], getVoteUsed)
  const { data: filteredRes } = useQuery(["filteredVotes"], getFilteredVotes)

  const filteredVote = filteredRes?.reduce(
    (acc, { args: { user, time, weight, gauge_addr } }) => {
      const gaugeAddr = gauge_addr.toLowerCase()
      if (user === account && gaugeNames[gaugeAddr]) {
        acc[gaugeAddr] = {
          gaugeName: gaugeNames[gaugeAddr].gaugeName,
          voteDate: time.toNumber(),
          weight,
        }
      }
      return acc
    },
    {} as VotesType,
  )

  const handleVote = async () => {
    const errorMsg = "Failed to vote"
    if (voteWeightToSubmit && isNumberOrEmpty(voteWeightToSubmit) && chainId) {
      try {
        if (veSdlBalance.isZero()) {
          setAlertMessage("You need veSDL to vote")
        } else if (selectedGauge?.address && gaugeControllerContract) {
          const txn = await gaugeControllerContract.vote_for_gauge_weights(
            selectedGauge.address,
            parseFloat(voteWeightToSubmit) * 100, //convert percent to bps
          )
          await enqueuePromiseToast(chainId, txn.wait(), "vote")
          setSelectedGauge(null) // Initialize selectedGauge
          setVoteWeightToSubmit("") // Initialize vote weight input
        }
      } catch (error) {
        console.error("error on vote ==>", error)
        enqueueToast("error", errorMsg)
      }
    }
  }

  return (
    <React.Fragment>
      <Stack spacing={2} px={2} pt={2} mb={2}>
        <Typography variant="h2" textAlign="center">
          {t("voteForNextWeek")}
        </Typography>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex">
            <Typography component="label">
              {t("yourVotingPower")}:
              <Typography component="span" mx="8px">
                {commify(formatBNToString(veSdlBalance, 18, 2))}
              </Typography>
              veSDL
            </Typography>
          </Box>
          <Link
            sx={{
              color: theme.palette.text.primary,
              textDecorationColor: theme.palette.text.primary,
              whiteSpace: "nowrap",
            }}
          >
            {t("gaugeDoc")}
          </Link>
        </Box>
        {alertMessage && (
          <Alert severity="error">
            <Typography textAlign="center">{alertMessage}</Typography>
          </Alert>
        )}
        <Box
          border={`1px solid ${theme.palette.other.divider}`}
          px={2}
          pt={2}
          borderRadius="10px"
        >
          <Autocomplete
            id="gauge-names"
            options={Object.values(gaugeNames)}
            getOptionLabel={(option) => option?.gaugeName ?? ""}
            popupIcon={<ArrowDownIcon />}
            renderInput={(params) => (
              <TextField
                variant="standard"
                {...params}
                placeholder={t("chooseGauge")}
              />
            )}
            onChange={(event, newGaugeName) => {
              if (newGaugeName) {
                setSelectedGauge(newGaugeName)
              }
            }}
            value={selectedGauge}
            // check whether the current value belong to options
            isOptionEqualToValue={(option, value) =>
              option.address === value.address
            }
          />
          <Box display="flex" gap={4} my={2}>
            <TextField
              variant="standard"
              label={t("votingWeight")}
              type="text"
              value={voteWeightToSubmit}
              onChange={(event) => {
                if (isNumberOrEmpty(event.target.value)) {
                  const estimatedWeight =
                    parseFloat(event.target.value) +
                    (voteUsed?.toNumber() ?? 0) / 100
                  if (estimatedWeight > 100) {
                    setVoteWeightInputError({
                      hasError: true,
                      errorText: "Used too much power",
                    })
                  } else {
                    setVoteWeightInputError({
                      hasError: false,
                      errorText: " ",
                    })
                  }
                  setVoteWeightToSubmit(event.target.value)
                }
              }}
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" color="text.secondary" mr={1}>
                    %
                  </Typography>
                ),
              }}
              error={voteWeightInputError.hasError}
              helperText={voteWeightInputError.errorText}
              sx={{ flex: 0, minWidth: { xs: 130, sm: 160 } }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ minWidth: 124, height: 40 }}
              onClick={() => void handleVote()}
              disabled={!voteWeightToSubmit || !selectedGauge}
            >
              {t("voteThisGauge")}
            </Button>
          </Box>
        </Box>
      </Stack>
      <VoteHistory
        gaugeControllerContract={gaugeControllerContract}
        votes={filteredVote ?? {}}
        voteUsed={voteUsed}
      />
    </React.Fragment>
  )
}
