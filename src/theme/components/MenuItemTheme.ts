import { Components } from "@mui/material"

export default function MenuItemTheme(): Components {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          // TODO: Give hover color after defining the dark theme color
          // "&:hover": {
          //   // backgroundColor: theme.palette.secondary.light,
          // },
        },
      },
    },
  }
}
