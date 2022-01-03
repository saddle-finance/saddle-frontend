import { Box, Dialog, Typography } from "@mui/material"
import React, { ReactElement } from "react"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import { Web3Provider } from "@ethersproject/providers"
import { useTranslation } from "react-i18next"

interface Props {
  open?: boolean
}

export default function WrongNetworkModal({ open }: Props): ReactElement {
  const { error } = useWeb3React<Web3Provider>()
  const isUnsupportChainIdError = error instanceof UnsupportedChainIdError
  const { t } = useTranslation()

  return (
    <Dialog open={open ?? isUnsupportChainIdError} maxWidth="xs">
      <Box padding={3}>
        <Typography variant="h3" textAlign="center" mb={3}>
          &#129325;
        </Typography>
        {t("wrongNetworkContent")}
      </Box>
    </Dialog>
  )
}
