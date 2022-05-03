import { Components } from "@mui/material"

export default function PaperTheme(): Components {
  return {
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: "pointer",
        },
      },
    },
  }
}
