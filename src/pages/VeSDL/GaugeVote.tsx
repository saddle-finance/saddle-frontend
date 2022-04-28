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
import React from "react"
import { useTranslation } from "react-i18next"

export default function GaugeVote(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h2" textAlign="center">
        Gauge Vote
      </Typography>
      <Box height="428px"></Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Vote period</TableCell>
              <TableCell align="center">Snapshot link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Current week</TableCell>
              <TableCell align="center">
                <Button variant="contained" size="medium">
                  <Typography>Vote</Typography>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography textAlign="end">
        <Link color="inherit">{t("viewAllVote")}</Link>
      </Typography>
    </Paper>
  )
}
