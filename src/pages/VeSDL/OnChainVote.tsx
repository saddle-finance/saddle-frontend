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
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import React from "react"

export default function OnChainVote() {
  const theme = useTheme()

  return (
    <Stack spacing={2}>
      <Typography variant="h2" textAlign="center">
        Vote for next week
      </Typography>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex">
          <Typography component="label">
            Your voting power: 1000 veSDL{" "}
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
        options={["first", "second"]}
        popupIcon={<ArrowDownIcon />}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params}
            placeholder="Choose a gauge"
          />
        )}
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
        >
          Vote this gauge
        </Button>
      </Box>
      <Typography variant="subtitle1" textAlign="center">
        My Votes
      </Typography>

      <Table>
        <TableHead>
          <TableCell>Gauge</TableCell>
          <TableCell>Weight</TableCell>
          <TableCell>Reset vote</TableCell>
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
