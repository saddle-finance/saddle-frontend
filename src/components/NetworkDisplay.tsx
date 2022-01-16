import { Button, Typography } from "@mui/material"
import { ChainId, IS_L2_SUPPORTED } from "../constants"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"

import CircleTwoToneIcon from "@mui/icons-material/CircleTwoTone"
import { NETWORK_LABEL } from "../constants/networks"
import React from "react"

type ButtonProps = React.HTMLProps<HTMLButtonElement>

const NetworkDisplay = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function NetworkDisplay(porps, ref) {
    const { active, chainId, error } = useWeb3React()
    const networkLabel: string =
      (chainId ? NETWORK_LABEL[chainId as ChainId] : undefined) ?? "Ethereum"
    const isUnsupportChainIdError = error instanceof UnsupportedChainIdError

    return IS_L2_SUPPORTED ? (
      <Button
        ref={ref}
        data-testid="networkDisplayBtn"
        variant="outlined"
        color="secondaryLight"
        startIcon={
          <CircleTwoToneIcon
            color={!isUnsupportChainIdError && active ? "success" : "error"}
            fontSize="small"
          />
        }
      >
        <Typography variant="body1" color="text.primary">
          {networkLabel}
        </Typography>
      </Button>
    ) : null
  },
)
export default NetworkDisplay
