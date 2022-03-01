import { Components } from "@mui/material"

export default function RadioButtonTheme(): Components {
  return {
    MuiRadio: {
      defaultProps: {},
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "transparent",
          },
        },
      },
    },
  }
}
