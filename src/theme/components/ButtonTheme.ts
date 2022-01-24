import {
  ButtonPropsColorOverrides,
  Components,
  ComponentsVariants,
  Theme,
} from "@mui/material"
import { OverridableStringUnion } from "@mui/types"

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    secondaryLight: true
  }
}
type ColorVariant = OverridableStringUnion<
  "primary" | "secondary" | "success" | "error" | "info" | "warning",
  ButtonPropsColorOverrides
>

const containedStyle = (
  colors: ColorVariant[],
  theme: Theme,
): ComponentsVariants["MuiButton"] =>
  colors.map((color) => ({
    props: {
      color: color,
    },
    style: {
      "&:hover": {
        backgroundColor: theme.palette[color].states?.containedHoverBackground,
      },
    },
  }))
export default function ButtonTheme(theme: Theme): Components {
  return {
    MuiButton: {
      variants: containedStyle(
        ["primary", "secondary", "secondaryLight"],
        theme,
      ),
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
        sizeMedium: {
          lineHeight: 0,
          minWidth: 70,
          height: 32,
          padding: 8,
          font: theme.typography.body1.font,
        },
        sizeSmall: {
          minWidth: 0,
          padding: 1,
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
