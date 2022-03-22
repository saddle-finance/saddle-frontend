import { Components, Theme } from "@mui/material"

export default function ChipTheme(theme: Theme): Components {
  return {
    MuiChip: {
      styleOverrides: {
        root: {},
        sizeSmall: {
          height: "fit-content",
          borderRadius: theme.spacing(0.5),
        },
        labelSmall: {
          padding: "0px 2px 0px 2px",
          fontSize: theme.typography.subtitle2.fontSize,
          fontWeight: theme.typography.subtitle2.fontWeight,
        },
      },
    },
  }
}
