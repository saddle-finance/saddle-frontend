import { Components, Theme } from "@mui/material"

export default function LinkTheme(theme: Theme): Components {
  return {
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: "pointer",
          color: theme.palette.secondary.light,
          "&:hover": {
            color: theme.palette.secondary.main,
          },
        },
      },
    },
  }
}
