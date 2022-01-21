import { Components, Theme } from "@mui/material"

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    secondaryLight: true
  }
}
export default function ButtonTheme(theme: Theme): Components {
  return {
    MuiButton: {
      variants: [
        {
          props: {
            variant: "contained",
            size: "small",
          },
          style: {
            minWidth: 0,
            padding: 1,
          },
        },
      ],
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: theme.spacing(1),
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        outlined: {
          "&:hover": {
            backgroundColor: theme.palette.secondaryLight.main,
          },
        },
        sizeMedium: {
          lineHeight: 0,
          minWidth: 70,
          maxHeight: 32,
          padding: 8,
          font: theme.typography.body1.font,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  }
}
