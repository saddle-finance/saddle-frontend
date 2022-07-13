import {
  Box,
  Button,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import {
  SNAPSHOT_STATE,
  VoteEscrowSnapshots,
} from "../../state/voteEscrowSnapshots"

import { AppState } from "../../state"
import GaugeWeight from "../../components/GaugeWeight"
import React from "react"
import { generateSnapshotVoteLink } from "../../utils"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export default function GaugeVote(): JSX.Element {
  const { snapshots }: VoteEscrowSnapshots = useSelector(
    (state: AppState) => state.voteEscrowSnapshots,
  )

  const { t } = useTranslation()
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h2" textAlign="center">
        {t("gaugeVote")}
      </Typography>
      <Box height="428px">
        <GaugeWeight />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell variant="head">{t("votePeriod")}</TableCell>
              <TableCell variant="head" align="center">
                {t("snapshotLink")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {snapshots.map((snapshot, index) => {
              const voteOrView =
                snapshot.state === SNAPSHOT_STATE.CLOSED
                  ? t("results")
                  : t("vote")
              return (
                <TableRow key={`snapshot-${index}`}>
                  <TableCell>
                    {new Date(snapshot.start * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="medium"
                      href={generateSnapshotVoteLink(snapshot.id)}
                      target="_blank"
                      sx={{ minWidth: 100 }}
                    >
                      <Typography>{voteOrView}</Typography>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography textAlign="end" mt={1}>
        <Link color="inherit" href={generateSnapshotVoteLink()} target="_blank">
          {t("viewAllVote")}
        </Link>
      </Typography>
    </Paper>
  )
}
