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
            variant: "outlined",
          },
          style: {
            "&:hover": {
              backgroundColor: theme.palette.secondaryLight.main,
            },
          },
        },
        {
          props: {
            variant: "contained",
          },
          style: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: theme.spacing(1),
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
