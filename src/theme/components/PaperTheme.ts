import { Components } from "@mui/material"

export default function PaperTheme(): Components {
  return {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #000000",
          boxShadow: "none",
          opacity: 1,
        },
      },
    },
  }
}
