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
            border: `1px solid ${theme.palette.primary.main}`,
            "&:hover": {
              backgroundColor: theme.palette.action.active,
            },
          },
          "&:hover": {
            backgroundColor: theme.palette.mute.main,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.mute.main,
          maxHeight: 28,
        },
        grouped: {
          border: 0,
        },
      },
    },
  }
}
