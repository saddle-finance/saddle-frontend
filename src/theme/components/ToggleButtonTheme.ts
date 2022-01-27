import { Components, Theme } from "@mui/material"

export default function ToggleButtonTheme(theme: Theme): Components {
  console.log("theme", theme)
  return {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: theme.palette.getContrastText(theme.palette.mute.main),
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.active,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.mute.main,
        },
      },
    },
  }
}
