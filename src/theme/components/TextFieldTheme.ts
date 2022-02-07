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
          paddingTop: 6.5,
          paddingBottom: 6.5,
        },
      },
    },
  }
}
