import { Components, Theme } from "@mui/material"

export default function TooltipTheme(theme: Theme): Components {
  return {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        popper: {},
        tooltip: {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 4,
          color: theme.palette.primary.contrastText,
          fontsize: 12,
          lineHeight: 16 / 12,
          fontWeight: 400,
        },
        arrow: {
          color: theme.palette.primary.main,
        },
      },
    },
  }
}
