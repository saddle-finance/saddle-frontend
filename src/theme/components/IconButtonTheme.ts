import { Components, Theme } from "@mui/material"

export default function IconButtonTheme(theme: Theme): Components {
  return {
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: theme.palette.text.secondary,
        },
      },
    },
  }
}
