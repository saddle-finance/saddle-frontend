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
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { commify, formatBNToString, isNumberOrEmpty } from "../../utils"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BigNumber } from "ethers"
import { Gauge } from "../../utils/gauges"
import { GaugeController } from "../../../types/ethers-contracts/GaugeController"
import VoteHistory from "./Votes"
import { enqueuePromiseToast } from "../../components/Toastify"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

interface OnChainVoteProps {
  veSdlBalance: BigNumber
  gauges: Partial<{
    [lpTokenAddress: string]: Gauge
  }>
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
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const [selectedGauge, setSelectedGauge] = useState<{
    gaugeName: string
    address: string
  } | null>(null)
  const [alertMessage, setAlertMessage] = useState<string>()
  const [voteWeightToSubmit, setVoteWeightToSubmit] = useState<string>("")
  const [voteUsed, setVoteUsed] = useState<number | undefined>()
  const [votes, setVotes] = useState<VotesType>({})
  const [voteWeightInputError, setVoteWeightInputError] = useState<{
    hasError: boolean
    errorText: string
  }>({ hasError: false, errorText: " " })

  const gaugeNames = useMemo(
    () =>
      Object.keys(gauges)
        .filter((lpAddress) => !gauges[lpAddress]?.isKilled)
        .reduce((acc, curr) => {
          const gaugeName = gauges[curr]?.gaugeName
          const gaugeAddress = gauges[curr]?.address.toLowerCase()
          if (gaugeName && gaugeAddress)
            acc[gaugeAddress] = {
              address: gaugeAddress,
              gaugeName: gaugeName,
            }
          return acc
        }, {} as GaugeName),
    [gauges],
  )

  const getVoteUsed = useCallback(async () => {
    if (account) {
      const voteUsed = await gaugeControllerContract[
        "vote_user_power(address)"
      ](account)
      setVoteUsed(voteUsed.toNumber())
    }
  }, [account, gaugeControllerContract])

  const getFilteredVotes = useCallback(async () => {
    const voteFilter = gaugeControllerContract.filters.VoteForGauge(
      null,
      null,
      null,
      null,
    )
    const filteredRes = await gaugeControllerContract.queryFilter(voteFilter)

    const filteredVotes = filteredRes.reduce(
      (acc, { args: { user, time, weight, gauge_addr } }) => {
        if (user === account) {
          acc[gauge_addr.toLowerCase()] = {
            gaugeName: gaugeNames[gauge_addr.toLowerCase()].gaugeName,
            voteDate: time.toNumber(),
            weight,
          }
        }
        return acc
      },
      {} as VotesType,
    )
    setVotes(filteredVotes)
  }, [account, gaugeControllerContract, gaugeNames])

  useEffect(() => {
    void getFilteredVotes()
    void getVoteUsed()
  }, [getFilteredVotes, getVoteUsed])

  useEffect(() => {
    if (account && gaugeControllerContract) {
      gaugeControllerContract.on(
        "VoteForGauge",
        (voteDate, fromAddress, gaugeAddress, voteWeight) => {
          const gaugeName =
            gaugeNames[(gaugeAddress as string).toLowerCase()].gaugeName

          if (
            gaugeName &&
            (fromAddress as string).toLowerCase() === account.toLowerCase()
          ) {
            setVotes((currentVoteLists) => ({
              ...currentVoteLists,
              [(gaugeAddress as string).toLowerCase()]: {
                gaugeName: gaugeName,
                voteDate: (voteDate as BigNumber).toNumber(),
                weight: voteWeight as BigNumber,
              },
            }))
            void getVoteUsed()
          }
        },
      )
    }
    return () => {
      gaugeControllerContract.removeAllListeners()
    }
  }, [gaugeControllerContract, gaugeNames, votes, getVoteUsed, account])

  const handleVote = async () => {
    const voteWeightPercent = parseFloat(voteWeightToSubmit)
    if (!Number.isNaN(voteWeightPercent)) {
      try {
        if (veSdlBalance.isZero()) {
          setAlertMessage("You need veSDL to vote")
        } else if (selectedGauge?.address && gaugeControllerContract) {
          const txn = await gaugeControllerContract.vote_for_gauge_weights(
            selectedGauge.address,
            Math.round(voteWeightPercent * 100), //convert percent to bps
          )
          await enqueuePromiseToast(1, txn.wait(), "vote")
          setSelectedGauge(null) // Initialize selectedGauge
          setVoteWeightToSubmit("") // Initialize vote weight input
        }
      } catch (error) {
        console.error("error on vote ==>", error)
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
            options={Object.keys(gaugeNames).map((key) => gaugeNames[key])}
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
              option?.address === value?.address
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
                    parseFloat(event.target.value) + (voteUsed ?? 0) / 100
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
        votes={votes}
        voteUsed={voteUsed}
      />
    </React.Fragment>
  )
}
