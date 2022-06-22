import { Box, Button, DialogContent, Stack, Typography } from "@mui/material"
import Dialog from "../../components/Dialog"
import React from "react"

type Props = {
  open: boolean
  onClose: () => void
}

export default function ClaimRewardsDlg({ open, onClose }: Props): JSX.Element {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent sx={{ mt: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h2" textAlign="center">
            Claim Rewards in alETH Farm
          </Typography>
          <Typography>
            Stake your LP token and collect SDL incentives.
          </Typography>
          <Box>
            <Typography>LP Staked:</Typography>
            <Typography mt={2}>Rewards:</Typography>
          </Box>
          <Button variant="contained" size="large">
            Claim Rewards
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
