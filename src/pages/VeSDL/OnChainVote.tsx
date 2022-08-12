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
import React, { useContext, useMemo, useState } from "react"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { GaugeContext } from "../../providers/GaugeProvider"
import VoteHistory from "./VoteHistory"
import { enqueuePromiseToast } from "../../components/Toastify"
import { useGaugeControllerContract } from "../../hooks/useContract"

interface OnChainVoteProps {
  veSdlBalance: string
}
export type GaugeName = {
  address: string
  gaugeName: string
}

export default function OnChainVote({ veSdlBalance }: OnChainVoteProps) {
  const theme = useTheme()
  const { gauges } = useContext(GaugeContext)
  const [selectedGauge, setSelectedGauge] = useState<GaugeName | null>(null)
  const [voteWeightToSubmit, setVoteWeightToSubmit] = useState<string>("")
  const gaugeControllerContract = useGaugeControllerContract(true)

  const gaugeNames = useMemo(
    () =>
      Object.keys(gauges)
        .filter((lpAddress) => !gauges[lpAddress]?.isKilled)
        .map((lpAddress) => {
          const gaugeName = gauges[lpAddress]?.gaugeName
          const gaugeAddress = gauges[lpAddress]?.address
          if (gaugeName && gaugeAddress)
            return {
              address: gaugeAddress,
              gaugeName: gaugeName,
            } as GaugeName
        }),

    [gauges],
  )

  if (Object.keys(gauges).length === 0) return <div>Loading...</div>

  const handleVote = async () => {
    const voteWeightPercent = parseFloat(voteWeightToSubmit)
    if (!Number.isNaN(voteWeightPercent)) {
      try {
        if (selectedGauge?.address && gaugeControllerContract) {
          const txn = await gaugeControllerContract.vote_for_gauge_weights(
            selectedGauge.address,
            Math.round(voteWeightPercent * 100), //convert percent to bps
          )
          void enqueuePromiseToast(1, txn.wait(), "unlock")
        }
      } catch (error) {
        console.log("error on vote ==>", error)
      }
    }
  }

  return (
    <div>
      <Stack spacing={2} px={2} pt={2}>
        <Typography variant="h2" textAlign="center">
          Vote for next week
        </Typography>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex">
            <Typography component="label">
              Your voting power: {veSdlBalance} veSDL{" "}
            </Typography>
          </Box>
          <Link
            sx={{
              color: theme.palette.text.primary,
              textDecorationColor: theme.palette.text.primary,
              whiteSpace: "nowrap",
            }}
          >
            Gauge doc
          </Link>
        </Box>
        <Alert severity="error">
          <Typography textAlign="center">Used too much power</Typography>
        </Alert>
        <Box
          border={`1px solid ${theme.palette.other.divider}`}
          px={2}
          pt={2}
          borderRadius="10px"
        >
          <Autocomplete
            id="gauge-names"
            options={gaugeNames}
            getOptionLabel={(option) => option?.gaugeName ?? ""}
            popupIcon={<ArrowDownIcon />}
            renderInput={(params) => (
              <TextField
                variant="standard"
                {...params}
                placeholder="Choose a gauge"
              />
            )}
            onChange={(event, newGaugeName) => {
              if (newGaugeName) {
                setSelectedGauge(newGaugeName)
                setVoteWeightToSubmit("")
              }
            }}
            //value of selected gauge
            value={selectedGauge}
            // check whether the current value belong to options
            isOptionEqualToValue={(option, value) =>
              option?.address === value?.address
            }
          />
          <Box display="flex" gap={4} mt={2}>
            <TextField
              variant="standard"
              label="Voting Weight"
              type="text"
              value={voteWeightToSubmit}
              onChange={(event) => setVoteWeightToSubmit(event.target.value)}
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" color="text.secondary">
                    %
                  </Typography>
                ),
              }}
              helperText=" "
              sx={{ flex: 0, minWidth: { xs: 130, sm: 160 } }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ minWidth: 124 }}
              onClick={() => void handleVote()}
            >
              Vote this gauge
            </Button>
          </Box>
        </Box>
      </Stack>
      <VoteHistory
        gaugeControllerContract={gaugeControllerContract}
        gaugeNames={gaugeNames}
      />
    </div>
  )
}
