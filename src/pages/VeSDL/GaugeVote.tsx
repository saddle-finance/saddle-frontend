import {
  Box,
  Button,
  CircularProgress,
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
import React, { useContext } from "react"
import { GaugeContext } from "../../providers/GaugeProvider"
import GaugeWeight from "../../components/GaugeWeight"
import { useTranslation } from "react-i18next"

export default function GaugeVote(): JSX.Element {
  const gaugeData = useContext(GaugeContext)
  const { t } = useTranslation()
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h2" textAlign="center">
        {t("gaugeVote")}
      </Typography>
      <Box minHeight="428px">
        {!gaugeData ? (
          <Box
            display="flex"
            height="100%"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <GaugeWeight gauges={gaugeData.gauges} />
        )}
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
            <TableRow>
              <TableCell>{t("currentWeek")}</TableCell>
              <TableCell align="center">
                <Button variant="contained" size="medium">
                  <Typography>{t("vote")}</Typography>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography textAlign="end" mt={1}>
        <Link color="inherit">{t("viewAllVote")}</Link>
      </Typography>
    </Paper>
  )
}
