import { Components } from "@mui/material"

export default function TooltipTheme(): Components {
  return {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
  }
}
