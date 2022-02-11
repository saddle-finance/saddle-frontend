import { Components, Theme } from "@mui/material"

export default function ChipTheme(theme: Theme): Components {
  return {
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          borderRadius: theme.spacing(0.5),
        },
        labelSmall: {
          padding: 2,
        },
        labelMedium: {
          padding: "5px, 8px, 5px, 8px",
        },
      },
    },
  }
}
