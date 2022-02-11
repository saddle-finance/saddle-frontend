import { Components } from "@mui/material"

export default function CheckboxTheme(): Components {
  return {
    MuiCheckbox: {
      defaultProps: {
        disableFocusRipple: true,
        disableTouchRipple: true,
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          padding: "0px 11px 0px 0px",
        },
      },
    },
  }
}
