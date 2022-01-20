import { Components } from "@mui/material"

export default function AppBarTheme(): Components {
  return {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderColor: "transparent",
          backgroundColor: "transparent",
        },
      },
    },
  }
}
