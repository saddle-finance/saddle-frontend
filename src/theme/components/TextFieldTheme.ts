import { Components } from "@mui/material"

export default function TextFieldTheme(): Components {
  return {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 28,
        },
        notchedOutline: {
          top: "-10px",
        },
      },
    },
  }
}
