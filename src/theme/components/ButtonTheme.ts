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
        {
          props: {
            size: "medium",
          },
          style: {
            lineHeight: 0,
            maxHeight: 32,
            padding: 8,
          },
        },
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
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  }
}
