import { Components, Theme } from "@mui/material"

export default function TableCellTheme(theme: Theme): Components {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: theme.typography.body2.fontSize,
          fontWeight: theme.typography.body2.fontWeight,
          padding: "0 8px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "& td": { border: 0 },
          "& th": {
            fontSize: 14,
            fontWeight: 500,
          },
        },
      },
    },
  }
}
