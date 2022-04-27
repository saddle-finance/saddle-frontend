import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { DatePicker } from "@mui/lab"
import TokenInput from "../../components/TokenInput"

export default function VeSDL(): JSX.Element {
  const [date, setDate] = useState<string | null>(null)
  const handleChange = () => {
    console.log("first")
  }
  return (
    <Container>
      <Box display="flex" gap={2}>
        <Box flex={1}>
          <Paper
            sx={{
              display: "flex",
              p: 4,
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h2" textAlign="center">
              SDL Lock
            </Typography>

            <TokenInput
              data-testid="sdlTokenInput"
              symbol="SDL"
              name="sdl"
              onChange={handleChange}
              inputValue="0.0"
            />
            <Box display="flex" alignItems="center">
              <div>
                <Typography mr={1} noWrap>
                  Unlock date:
                </Typography>
              </div>
              <DatePicker
                value={date}
                onChange={(date) => setDate(date)}
                renderInput={(props) => (
                  <TextField {...props} size="small" fullWidth />
                )}
              />
            </Box>
            <Box textAlign="center">
              <ArrowDownwardIcon />
            </Box>
            <TokenInput
              symbol="veSDL"
              name="Vote escrow SDL"
              onChange={handleChange}
              inputValue="0.0"
            />
            <Button variant="contained" fullWidth size="large">
              Lock
            </Button>
            <Typography textAlign="end">
              <Link>veToken calculator</Link>
            </Typography>
            <Divider />
            <Typography variant="h2" textAlign="center" mb={2}>
              veSDL Unlock
            </Typography>
            <Typography>Total SDL locked: 3000</Typography>
            <Typography>Lockup Expiray: 09/06/2022</Typography>
            <Alert severity="error" icon={false} sx={{ textAlign: "center" }}>
              Withdraw now has 2000 SDL penalty.
            </Alert>
            <Button variant="contained" size="large" fullWidth>
              Unlock
            </Button>
          </Paper>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h2" textAlign="center">
              veSDL Holder Fee Claim
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <Typography>Youe SDL/FRAX LP fee: 200</Typography>
              <Button variant="contained" size="large">
                Claim
              </Button>
            </Box>
          </Paper>
        </Box>

        <Box flex={1}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography>SDL locked</Typography>
            <Typography>Total veSDL</Typography>
            <Typography>Avg. lock time</Typography>
          </Paper>
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
              <Link color="inherit">View all votes</Link>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}
