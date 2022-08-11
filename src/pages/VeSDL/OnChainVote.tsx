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
  TableHead,
  TableRow,
  TextField,
  Typography,
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
export default function OnChainVote({ veSdlBalance }: OnChainVoteProps) {
  const theme = useTheme()
  const { gauges } = useContext(GaugeContext)
  const { account } = useActiveWeb3React()
  const [selectedGauge, setSelectedGauge] = useState<GaugeName | null>(null)
  const [voteLists, setVoteLists] = useState<VoteList[]>([])
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

  console.log("gauge names ==>", gaugeNames)

  useEffect(() => {
    gaugeControllerContract?.on(
      "VoteForGauge",
      (timestamp, from, gaugeAddress, weight) => {
        const gaugeName = gaugeNames.find(
          (gaugeName) => gaugeName?.address == (gaugeAddress as string),
        )?.gaugeName

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
    if (account && selectedGauge?.address) {
      const result = await gaugeControllerContract?.vote_user_slopes(
        account,
        selectedGauge.address,
      )
      console.log("result ==>", result)
    }
  }, [account, gaugeControllerContract, selectedGauge?.address])

  useEffect(() => {
    void getVoteUserSlops()
  }, [getVoteUserSlops])

  if (!gauges) return <div>Loading...</div>

  const handleVote = async () => {
    try {
      if (selectedGauge?.address && gaugeControllerContract) {
        const txn = await gaugeControllerContract.vote_for_gauge_weights(
          selectedGauge.address,
          100,
        )
        void enqueuePromiseToast(1, txn.wait(), "unlock")
      }
    } catch (error) {
      console.log("error on vote ==>", error)
    }
  }

  return (
    <Stack spacing={2}>
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
          }
        }}
        //value of selected gauge
        value={selectedGauge}
        // check whether the current value belong to options
        isOptionEqualToValue={(option, value) =>
          option?.address === value?.address
        }
      />
      <Box display="flex" gap={4}>
        <TextField
          label="Voting Weight"
          type="text"
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
          variant="outlined"
          size="medium"
          sx={{ borderRadius: "4px", minWidth: 124 }}
          onClick={() => void handleVote()}
        >
          Vote this gauge
        </Button>
      </Box>
      <Typography variant="subtitle1" textAlign="center">
        My Votes
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Gauge</TableCell>
            <TableCell>Weight</TableCell>
            <TableCell>Reset vote</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ td: { border: 0, py: "6px", px: "8px" } }}>
            <TableCell>SDL/WETH SLP(0x12...1234)</TableCell>
            <TableCell>10.12%</TableCell>
            <TableCell align="right">
              <Button>Delete</Button>
            </TableCell>
          </TableRow>
          <TableRow sx={{ td: { border: 0, py: "6px", px: "8px" } }}>
            <TableCell>SDL/WETH SLP(0x12...1234)</TableCell>
            <TableCell>10.12%</TableCell>
            <TableCell align="right">
              <Button>Delete</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  )
}
