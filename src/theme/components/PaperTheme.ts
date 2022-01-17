import { Components, Theme } from "@mui/material"

export default function PaperTheme(theme: Theme): Components {
  return {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.background.paper
              : theme.palette.background.default,
          border:
            theme.palette.mode === "light"
              ? `1px solid theme.palette.other?.divider`
              : "1px solid #000000",
          boxShadow: "none",
          opacity: 1,
        },
      },
    },
  }
}
