import {
  Box,
  Button,
  DialogContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import Dialog from "../../components/Dialog"
import TokenInput from "../../components/TokenInput"

interface StakeDialogProps {
  open: boolean
  onClose: () => void
  farmName: string
}

export default function StakeDialog({
  open,
  farmName,
  onClose,
}: StakeDialogProps) {
  const [stakeStatus, setStakeStatus] = useState<"stake" | "unStake">("stake")
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ mt: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h1" textAlign="center">
            {farmName}
          </Typography>
          <Typography>
            Stake your LP token and collect SDL incentives.
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography>LP Staked</Typography>
              12334578.12
            </Box>
            <Box>
              <Typography>Rewards</Typography>
              12334578.12
            </Box>
            <Button variant="outlined" size="large">
              Claim
            </Button>
          </Stack>
          <Tabs
            value={stakeStatus}
            variant="fullWidth"
            onChange={(_, newValue) => setStakeStatus(newValue)}
          >
            <Tab value="stake" label="Stake" />
            <Tab value="unStake" label="Unstake" />
          </Tabs>
          <TokenInput
            inputValue="0.0"
            token={{ decimals: 18, name: "SDL", symbol: "SDL" }}
          />
          <Button fullWidth variant="contained" size="large">
            {stakeStatus === "stake" ? "Stake" : "Unstake"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
