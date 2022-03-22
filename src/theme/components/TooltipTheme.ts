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
          lineHeight: 16 / 12,
          fontSize: theme.typography.body2.fontSize,
          fontWeight: 400,
        },
        arrow: {
          color: theme.palette.primary.main,
        },
      },
    },
  }
}
