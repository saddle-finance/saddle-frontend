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
          paddingTop: 14.5,
          paddingBottom: 14.5,
        },
        inputSizeSmall: {
          paddingTop: 4,
          paddingBottom: 5,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          top: -3,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          paddingLeft: 8,
          paddingTop: 14.5,
          paddingBottom: 14.5,
        },
      },
    },
  }
}
