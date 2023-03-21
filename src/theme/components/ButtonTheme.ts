import { Components, ComponentsVariants, Theme } from "@mui/material"
import { ColorVariant } from "../../types"
import { createGradient2 } from "../../utils/createGradient2"

const buttonColorVariants: ColorVariant[] = [
  "primary",
  "secondary",
  "warning",
  "error",
  "info",
  "success",
]

const containedStyle = (
  colors: ColorVariant[],
  theme: Theme,
): ComponentsVariants["MuiButton"] =>
  colors.map((color) => ({
    props: {
      variant: "contained",
      color: color,
    },
    style: {
      background: theme.palette.gradient?.[color],
      color: "white",
      "&:hover": {
        background: createGradient2(
          theme.palette[color].light,
          theme.palette[color].light,
        ),
      },
    },
  }))

const outlinedStyle = (
  colors: ColorVariant[],
  theme: Theme,
): ComponentsVariants["MuiButton"] =>
  colors.map((color) => ({
    props: {
      variant: "outlined",
    },
    style: {
      border: `1px solid`,
      borderColor: theme.palette[color].light,
      color: theme.palette.getContrastText(theme.palette.background.paper),
      "&:hover": {
        backgroundColor: theme.palette[color].dark,
        color: theme.palette.getContrastText(
          theme.palette[color].dark || "#000000",
        ),
      },
    },
  }))

const textStyle = (
  colors: ColorVariant[],
  theme: Theme,
): ComponentsVariants["MuiButton"] =>
  colors.map((color) => ({
    props: {
      variant: "text",
      color: color,
    },
    style: {
      color: theme.palette[color].light,
      "&:hover": {
        backgroundColor: theme.palette[color].light,
        color: theme.palette[color].contrastText,
      },
    },
  }))
export default function ButtonTheme(theme: Theme): Components {
  return {
    MuiButton: {
      variants: outlinedStyle(buttonColorVariants, theme)?.concat(
        containedStyle(buttonColorVariants, theme) ?? [],
        textStyle(buttonColorVariants, theme) ?? [],
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
          font: theme.typography.body2.font,
          fontWeight: theme.typography.body2.fontWeight,
        },
        sizeSmall: {
          minWidth: 0,
          padding: 1,
          borderRadius: 3,
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
