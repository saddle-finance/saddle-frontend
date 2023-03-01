import {
  Components,
  ComponentsVariants,
  Theme,
  ToggleButtonPropsColorOverrides,
} from "@mui/material"
import { OverridableStringUnion } from "@mui/types"

type ToggleButtonColorVariant = OverridableStringUnion<
  "primary" | "secondary" | "success" | "error" | "info" | "warning",
  ToggleButtonPropsColorOverrides
>

const toggleButtonGropStyle = (
  colors: ToggleButtonColorVariant[],
  theme: Theme,
): ComponentsVariants["MuiToggleButtonGroup"] =>
  colors.map((color) => ({
    props: {
      color: color,
    },
    style: {
      backgroundColor:
        theme.palette.mode === "light"
          ? "white"
          : theme.palette.background.paper,
      border: `1px solid ${theme.palette.other.border}`,
      color: theme.palette.getContrastText(theme.palette[color].main),
      "&.Mui-selected": {
        borderLeft: `1px solid ${theme.palette[color].main}`,
        "&:hover": {
          backgroundColor: theme.palette[color].dark,
        },
      },
    },
  }))

const toggleButtonStyle = (
  colors: ToggleButtonColorVariant[],
  theme: Theme,
): ComponentsVariants["MuiToggleButton"] =>
  colors.map((color) => ({
    props: {
      color: color,
    },
    style: {
      color: theme.palette.getContrastText(theme.palette[color].main),
      "&.Mui-selected": {
        backgroundColor: theme.palette[color].main,
        color: theme.palette.getContrastText(theme.palette[color].main),
        "&:hover": {
          backgroundColor: theme.palette[color].dark,
        },
      },
      "&:hover": {
        backgroundColor: "transparent",
      },
      "&.MuiToggleButtonGroup-grouped": {
        border: 0,
        color: theme.palette.getContrastText(theme.palette.background.paper),
        "&.Mui-disabled": {
          border: 0,
          cursor: "not-allowed",
        },
      },
    },
  }))

const buttonColorVariants: ToggleButtonColorVariant[] = [
  "primary",
  "secondary",
  "info",
]

export default function ToggleButtonTheme(theme: Theme): Components {
  return {
    MuiToggleButton: {
      variants: toggleButtonStyle(buttonColorVariants, theme) ?? [],
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiToggleButtonGroup: {
      variants: toggleButtonGropStyle(buttonColorVariants, theme),
      styleOverrides: {
        root: {
          maxHeight: 32,
          borderRadius: 6,
        },
        grouped: {
          "&:not(:first-of-type)": {
            borderRadius: 6,
            marginLeft: 1,
          },
          "&:first-of-type": {
            borderRadius: 6,
          },
        },
      },
    },
  }
}
