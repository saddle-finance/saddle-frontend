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
          // TDDO: remove this hardcoded color
          border:
            theme.palette.mode === "light"
              ? "#E3D899"
              : `1px solid ${theme.palette.grey[500]}`,
          backgroundImage: "none",
          boxShadow: "none",
        },
      },
    },
  }
}
