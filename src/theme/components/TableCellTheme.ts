import { Components, Theme } from "@mui/material"

export default function TableCellTheme(theme: Theme): Components {
  return {
    MuiTableCell: {
      variants: [
        {
          props: {
            variant: "head",
          },
          style: {
            fontSize: theme.typography.subtitle1.fontSize,
            fontWeight: theme.typography.subtitle1.fontWeight,
          },
        },
      ],
      styleOverrides: {
        root: {
          fontSize: theme.typography.body1.fontSize,
          fontWeight: theme.typography.body1.fontWeight,
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.12)",
        },
      },
    },
  }
}
