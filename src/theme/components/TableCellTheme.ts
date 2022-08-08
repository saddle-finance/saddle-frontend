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
            fontSize: 14,
            fontWeight: 500,
          },
        },
      ],
      styleOverrides: {
        root: {
          fontSize: theme.typography.body2.fontSize,
          fontWeight: theme.typography.body2.fontWeight,
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.12)",
        },
      },
    },
  }
}
