import { Components, Theme } from "@mui/material"

export default function ToggleButtonTheme(theme: Theme): Components {
  return {
    MuiToggleButton: {
      variants: [
        {
          props: { color: "secondary" },
          style: {
            "&.Mui-selected": {
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.secondary.main,
            },
            "&:hover": {
              backgroundColor: theme.palette.secondary.dark,
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          textTransform: "none",
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
          borderRadius: 6,
        },
        grouped: {
          border: 0,
          "&.Mui-disabled": {
            border: 0,
          },
          "&.Mui-selected": {
            borderLeft: `1px solid ${theme.palette.primary.main}`,
          },
          "&:not(:first-of-type)": {
            borderRadius: 6,
            marginLeft: theme.spacing(0.5),
          },
          "&:first-of-type": {
            borderRadius: 6,
          },
        },
      },
    },
  }
}
