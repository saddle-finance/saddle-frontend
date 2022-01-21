import { Components, Theme } from "@mui/material"

declare module "@mui/material/IconButton" {
  interface ButtonPropsColorOverrides {
    secondaryLight: true
  }
}
export default function IconButtonTheme(theme: Theme): Components {
  return {
    MuiIconButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: theme.palette.text.secondary,
          ":hover": {
            backgroundColor: "tranparent",
          },
        },
      },
    },
  }
}
