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
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"
import { BigNumber } from "ethers"
import { GaugeController } from "../../../types/ethers-contracts/GaugeController"
import React from "react"
import { VotesType } from "./OnChainVote"
import { formatBNToPercentString } from "../../utils"
import { useTranslation } from "react-i18next"

const tenDaysInSecond = 3600 * 24 * 10

const VoteTableRow = styled(TableRow)(({ theme }) => ({
  "td:first-of-type": {
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

interface VoteHistoryProps {
  gaugeControllerContract: GaugeController | null
  voteUsed?: BigNumber
  votes: VotesType
}

export default function VoteHistory({
  gaugeControllerContract,
  votes,
  voteUsed,
}: VoteHistoryProps) {
  const theme = useTheme()
  const { t } = useTranslation()

  const handleResetVote = async (gaugeAddress: string) => {
    const errorMsg = "Failed to reset vote"
    try {
      if (gaugeControllerContract) {
        const txn = await gaugeControllerContract.vote_for_gauge_weights(
          gaugeAddress,
          0, // to reset vote with zero
        )
        void enqueuePromiseToast(1, txn.wait(), "vote")
      }
    } catch (error) {
      console.error("error on vote ==>", error)
      enqueueToast("error", errorMsg)
    }
  }

  if (Object.keys(votes).length === 0) return null

  return (
    <div>
      <Typography variant="h2" textAlign="center" my={2}>
        {t("myVotes")}
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
              <TableCell>{t("gauge")}</TableCell>
              <TableCell>{t("weight")}</TableCell>
              <TableCell align="right">{t("resetVote")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(votes).map((gaugeAddress) => {
              const vote = votes[gaugeAddress]
              const passed10Days =
                Date.now() / 1000 > vote.voteDate + tenDaysInSecond
              return (
                <VoteTableRow key={gaugeAddress}>
                  <TableCell>{vote.gaugeName}</TableCell>
                  <TableCell>
                    {formatBNToPercentString(vote.weight.div(100), 2)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      disabled={!passed10Days || vote.weight.isZero()}
                      onClick={() => void handleResetVote(String(gaugeAddress))}
                    >
                      {t("delete")}
                    </Button>
                  </TableCell>
                </VoteTableRow>
              )
            })}
          </TableBody>
        </Table>
        {!!voteUsed && (
          <Typography mt={1}>
            {t("totalWeightUsed")}:{" "}
            {formatBNToPercentString(voteUsed.div(100), 2)}
          </Typography>
        )}
      </TableContainer>
    </div>
  )
}
