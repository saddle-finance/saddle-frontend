import { createTheme } from "@mui/material"

// const seaweed = "#00F4D7"

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3800d6",
    },
    secondary: {
      main: "#00f4d7",
    },
    background: {
      default: "#ffffe9",
    },
  },

  spacing: 8,
  components: {
    MuiAppBar: {
      defaultProps: {
        color: "inherit",
      },
      styleOverrides: {
        colorInherit: {
          backgroundColor: "#FFFFE9",
          color: "#141414",
          border: "1px solid #FFFFE9",
          boxShadow: "transparent",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #000000",
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          boxShadow: "none",
          borderRadius: 6,
          minWidth: 176,
          minHeight: 40,
        },
      },
    },

    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
  },
})
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00f4d7",
    },
    secondary: {
      main: "#3800d6",
    },
    background: {
      default: "#000000",
      paper: "rgba(0,0,0,0.7)",
    },
  },
  spacing: 8,
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorInherit: {
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #000",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #FFF",
        },
      },
    },
  },
})
