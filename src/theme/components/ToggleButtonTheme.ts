import { Components, Theme } from "@mui/material"

export default function ToggleButtonTheme(theme: Theme): Components {
  console.log("theme", theme)
  return {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          color: theme.palette.getContrastText(theme.palette.mute.main),
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.active,
            border: `1px solid ${theme.palette.primary.main} !important`,
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
          marginLeft: theme.spacing(0.5),
          marginRight: theme.spacing(0.5),
          border: 0,
          "&.Mui-disabled": {
            border: 0,
          },
          "&:not(:first-of-type)": {
            borderRadius: theme.shape.borderRadius,
            // borderLeft: `1px solid ${theme.palette.primary.main}`,
          },
          "&:first-of-type": {
            borderRadius: theme.shape.borderRadius,
          },
        },
      },
    },
  }
}
