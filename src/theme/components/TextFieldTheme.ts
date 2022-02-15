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
        },
        sizeSmall: {
          height: 28,
        },
        notchedOutline: {
          top: "-10px",
        },
      },
    },
  }
}
