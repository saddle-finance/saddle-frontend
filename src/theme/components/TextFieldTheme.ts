import { Components } from "@mui/material"

export default function TextFieldTheme(): Components {
  return {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          paddingRight: 8,
        },
        input: {
          paddingLeft: 8,
          paddingTop: 2.5,
          paddingBottom: 2.5,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          top: -12,
        },
      },
    },
  }
}
