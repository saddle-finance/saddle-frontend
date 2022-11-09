import {
  AlertColor,
  Components,
  ComponentsVariants,
  Theme,
} from "@mui/material"

const alertColorVariants: AlertColor[] = ["success", "info", "warning", "error"]

const standardStyle = (
  colors: AlertColor[],
  theme: Theme,
): ComponentsVariants["MuiAlert"] =>
  colors.map((color) => ({
    props: {
      variant: "standard",
      severity: color,
    },
    style: {
      color: theme.palette.getContrastText(
        theme.palette[color].alert?.background || theme.palette[color].main,
      ),
      backgroundColor: theme.palette[color].alert?.background,
      borderColor: theme.palette[color].main,
      borderWidth: 1,
    },
  }))

export default function AlertTheme(theme: Theme): Components {
  return {
    MuiAlert: {
      variants: standardStyle(alertColorVariants, theme) ?? [],
      styleOverrides: {
        root: {
          fontSize: theme.typography.body1.fontSize,
          justifyContent: "center",
          "& .MuiAlert-icon": {
            color: theme.palette.error.main,
          },
        },
        icon: {
          opacity: 1,
        },
      },
    },
  }
}
