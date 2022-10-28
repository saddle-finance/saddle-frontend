import { Components, Theme } from "@mui/material"

export default function TypographyTheme(theme: Theme): Components {
  return {
    MuiTooltip: {
      defaultProps: {
        color: theme.palette.text.primary,
      },
    },
  }
}
