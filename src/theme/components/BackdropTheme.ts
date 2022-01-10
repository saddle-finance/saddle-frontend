import { Components } from "@mui/material"

export default function BackdropTheme(): Components {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.7)",
        },
      },
    },
  }
}
