import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
  useTheme,
} from "@mui/material"
import React, { useCallback, useContext, useEffect, useState } from "react"
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { BigNumber } from "ethers"
import { GaugeContext } from "../../providers/GaugeProvider"
import { enqueuePromiseToast } from "../../components/Toastify"
import { useActiveWeb3React } from "../../hooks"
import { useGaugeControllerContract } from "../../hooks/useContract"

interface OnChainVoteProps {
  veSdlBalance: string
}
type GaugeName = {
  address: string
  gaugeName: string
}
type VoteList = {
  gaugeName: string
  weight: BigNumber
}

const VoteTableRow = styled(TableRow)(({ theme }) => ({
  "td:first-child": {
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  "td:last-child": {
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
    padding: 0,
  },
  backgroundColor: theme.palette.background.paper,
}))

export default function OnChainVote({ veSdlBalance }: OnChainVoteProps) {
  const theme = useTheme()
  const { gauges } = useContext(GaugeContext)
  const { account } = useActiveWeb3React()
  const [selectedGauge, setSelectedGauge] = useState<GaugeName | null>(null)
  const [voteLists, setVoteLists] = useState<VoteList[]>([])
  const [voteUsed, setVoteUsed] = useState<number | undefined>()
  const [voteWeightToSubmit, setVoteWeightToSubmit] = useState<string>("")
  const gaugeControllerContract = useGaugeControllerContract(true)

  console.log("vote lists ==>", voteLists)

  const gaugeNames = Object.keys(gauges)
    .filter((lpAddress) => !gauges[lpAddress]?.isKilled)
    .map((lpAddress) => {
      const gaugeName = gauges[lpAddress]?.gaugeName
      const gaugeAddress = gauges[lpAddress]?.address
      if (gaugeName && gaugeAddress)
        return {
          address: gaugeAddress,
          gaugeName: gaugeName,
        } as GaugeName
    })

  useEffect(() => {
    gaugeControllerContract?.on(
      "VoteForGauge",
      (timestamp, from, gaugeAddress, weight) => {
        const gaugeName = gaugeNames.find(
          (gaugeName) => gaugeName?.address == (gaugeAddress as string),
        )?.gaugeName

        console.log("gauge address =>", gaugeAddress)
        console.log("gauge weight ==>", weight)

        if (gaugeName) {
          setVoteLists((currentVoteLists) => [
            ...currentVoteLists,
            {
              gaugeName: gaugeName,
              weight: weight as BigNumber,
            },
          ])
        }
      },
    )
    return () => {
      gaugeControllerContract?.removeAllListeners()
    }
  }, [gaugeControllerContract, gaugeNames, selectedGauge?.gaugeName])

  const getVoteUserSlops = useCallback(async () => {
    if (account) {
      const voteUsed = await gaugeControllerContract?.[
        "vote_user_power(address)"
      ](account)
      setVoteUsed(voteUsed?.toNumber())
    }
    if (account && selectedGauge?.address) {
      const result = await gaugeControllerContract?.vote_user_slopes(
        account,
        selectedGauge.address,
      )
      console.log("vote user slopes ==>", result)
    }
  }, [account, gaugeControllerContract, selectedGauge?.address])

  useEffect(() => {
    void getVoteUserSlops()
  }, [getVoteUserSlops])

  if (!gauges) return <div>Loading...</div>

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
      <Typography variant="h2" textAlign="center" my={2}>
        My Votes
      </Typography>

      <TableContainer
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.default,
          borderRadius: "10px",
        }}
      >
        <Table sx={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
          <TableHead>
            <TableRow sx={{ th: { border: 0 } }}>
              <TableCell>Gauge</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell align="right">Reset vote</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <VoteTableRow>
              <TableCell>SDL/WETH SLP(0x12...1234)</TableCell>
              <TableCell>10.12%</TableCell>
              <TableCell align="right">
                <Button variant="contained" color="secondary" size="large">
                  Delete
                </Button>
              </TableCell>
            </VoteTableRow>
            <VoteTableRow>
              <TableCell>SDL/WETH SLP(0x12...1234)</TableCell>
              <TableCell>10.12%</TableCell>
              <TableCell align="right">
                <Button variant="contained" color="secondary" size="large">
                  Delete
                </Button>
              </TableCell>
            </VoteTableRow>
          </TableBody>
        </Table>
        {voteUsed && (
          <Typography mt={1}>Total weight used: {voteUsed / 100}%</Typography>
        )}
      </TableContainer>
    </div>
  )
}
