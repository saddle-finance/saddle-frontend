import { Components } from "@mui/material"

declare module "@mui/material/IconButton" {
  interface ButtonPropsColorOverrides {
    secondaryLight: true
  }
}
export default function IconButtonTheme(): Components {
  return {
    MuiIconButton: {},
  }
}
