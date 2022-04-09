import { Components, Theme } from "@mui/material"

export default function DialogTheme(theme: Theme): Components {
  return {
    MuiDialog: {
      defaultProps: {
        BackdropProps: {
          timeout: 500,
        },
      },
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${theme.palette.other.divider}`,
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
  }
}
