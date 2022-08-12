import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { BigNumber } from "ethers"
import { GaugeController } from "../../../types/ethers-contracts/GaugeController"
import { GaugeName } from "./OnChainVote"
import { enqueuePromiseToast } from "../../components/Toastify"
import { useActiveWeb3React } from "../../hooks"

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

type VoteList = {
  gaugeAddress: string
  gaugeName: string
  weight: BigNumber
}

type Props = {
  gaugeControllerContract: GaugeController | null
  gaugeNames: (GaugeName | undefined)[]
}

export default function VoteHistory({
  gaugeControllerContract,
  gaugeNames,
}: Props) {
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const [voteUsed, setVoteUsed] = useState<number | undefined>()
  const [voteLists, setVoteLists] = useState<VoteList[]>([])

  const getVoteUsed = useCallback(async () => {
    if (account) {
      const voteUsed = await gaugeControllerContract?.[
        "vote_user_power(address)"
      ](account)
      setVoteUsed(voteUsed?.toNumber())
    }
  }, [account, gaugeControllerContract])

  const handleResetVote = async (gaugeAddress: string) => {
    try {
      if (gaugeControllerContract) {
        const txn = await gaugeControllerContract.vote_for_gauge_weights(
          gaugeAddress,
          0, // to reset vote with zero
        )
        void enqueuePromiseToast(1, txn.wait(), "unlock")
      }
    } catch (error) {
      console.log("error on vote ==>", error)
    }
  }

  useEffect(() => {
    gaugeControllerContract?.on(
      "VoteForGauge",
      (timestamp, from, gaugeAddress, weight) => {
        const gaugeName = gaugeNames.find(
          (gaugeName) =>
            gaugeName?.address.toLowerCase() ===
            (gaugeAddress as string).toLowerCase(),
        )?.gaugeName

        if (gaugeName) {
          setVoteLists((currentVoteLists) => [
            ...currentVoteLists,
            {
              gaugeAddress: gaugeAddress as string,
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
  }, [gaugeControllerContract, gaugeNames])

  useEffect(() => {
    void getVoteUsed()
  }, [getVoteUsed])

  if (voteLists.length === 0) return <div></div>

  return (
    <div>
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
            {voteLists.map((voteList) => (
              <VoteTableRow key={voteList.gaugeAddress}>
                <TableCell>{voteList.gaugeName}</TableCell>
                <TableCell>{voteList.weight.toNumber()}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => void handleResetVote(voteList.gaugeAddress)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </VoteTableRow>
            ))}
          </TableBody>
        </Table>
        {!!voteUsed && (
          <Typography mt={1}>Total weight used: {voteUsed / 100}%</Typography>
        )}
      </TableContainer>
    </div>
  )
}
