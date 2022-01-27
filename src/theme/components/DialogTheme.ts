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
          border:
            theme.palette.mode === "light"
              ? `1px solid ${theme.palette.other.divider}`
              : `1px solid ${theme.palette.grey[500]}`,
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
  }
}
