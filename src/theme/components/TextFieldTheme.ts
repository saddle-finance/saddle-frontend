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
          paddingTop: 4.5,
          paddingBottom: 4.5,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        helperText: "",
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          top: "-5px",
          "&.Mui-focused": {
            top: 0,
          },
        },
      },
    },
  }
}
