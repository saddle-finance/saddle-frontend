import { Button, Typography } from "@mui/material"
import { ChainId, NETWORK_LABEL } from "../constants/networks"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import CircleTwoToneIcon from "@mui/icons-material/CircleTwoTone"
import { IS_L2_SUPPORTED } from "../constants"

import React from "react"

interface NetworkDisplayProps extends React.ComponentPropsWithoutRef<"button"> {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}
const NetworkDisplay = React.forwardRef<HTMLButtonElement, NetworkDisplayProps>(
  function NetworkDisplay({ onClick }, ref) {
    const { active, chainId, error } = useWeb3React()
    const networkLabel: string = chainId
      ? NETWORK_LABEL[chainId as ChainId] || "Ethereum"
      : "Ethereum"
    const isUnsupportChainIdError = error instanceof UnsupportedChainIdError

    return (
      IS_L2_SUPPORTED && (
        <Button
          ref={ref}
          data-testid="networkDisplayBtn"
          variant="outlined"
          color="secondary"
          onClick={onClick}
          startIcon={
            <CircleTwoToneIcon
              color={!isUnsupportChainIdError && active ? "success" : "error"}
              fontSize="small"
            />
          }
        >
          <Typography
            display={{ xs: "none", sm: "block" }}
            variant="body1"
            color="text.primary"
            noWrap
          >
            {networkLabel}
          </Typography>
        </Button>
      )
    )
  },
)
export default NetworkDisplay
