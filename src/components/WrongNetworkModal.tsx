import { Box, Dialog, Typography } from "@mui/material"
import React, { ReactElement } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"

interface Props {
  open?: boolean
}

export default function WrongNetworkModal({ open }: Props): ReactElement {
  const { error } = useWeb3React<Web3Provider>()
  const isUnsupportChainIdError = error instanceof UnsupportedChainIdError

  return (
    <Dialog open={open ?? isUnsupportChainIdError} maxWidth="xs">
      <Box padding={3}>
        <Typography variant="h3" textAlign="center" mb={3}>
          &#129325;
        </Typography>
        <p>
          Opps, looks like you&apos;re trying to use Saddle while your wallet is
          connected to an unsupported network.
        </p>
        <br />
        <p>Please switch to Ethereum mainnet or another supported network.</p>
      </Box>
    </Dialog>
  )
}
