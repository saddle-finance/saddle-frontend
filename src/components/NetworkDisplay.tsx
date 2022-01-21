import { Button, Typography, useTheme } from "@mui/material"
import { ChainId, IS_L2_SUPPORTED } from "../constants"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"

import CircleTwoToneIcon from "@mui/icons-material/CircleTwoTone"
import { NETWORK_LABEL } from "../constants/networks"
import React from "react"

interface NetworkDisplayProps extends React.ComponentPropsWithoutRef<"button"> {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}
const NetworkDisplay = React.forwardRef<HTMLButtonElement, NetworkDisplayProps>(
  function NetworkDisplay({ onClick }, ref) {
    const { active, chainId, error } = useWeb3React()
    const theme = useTheme()
    const networkLabel: string =
      (chainId ? NETWORK_LABEL[chainId as ChainId] : undefined) ?? "Ethereum"
    const isUnsupportChainIdError = error instanceof UnsupportedChainIdError

    return IS_L2_SUPPORTED ? (
      <Button
        ref={ref}
        data-testid="networkDisplayBtn"
        variant="outlined"
        color="secondaryLight"
        onClick={onClick}
        startIcon={
          <CircleTwoToneIcon
            color={!isUnsupportChainIdError && active ? "success" : "error"}
            fontSize="small"
          />
        }
        sx={{ border: `1px solid ${theme.palette.action.hover}` }}
      >
        <Typography variant="body1" color="text.primary" noWrap>
          {networkLabel}
        </Typography>
      </Button>
    ) : null
  },
)
export default NetworkDisplay
