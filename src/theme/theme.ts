import { createTheme } from "@mui/material"
import { cssBaseline } from "./cssBaseline"

const saddleColors = {
  indigo: "#4B11F2",
  seafoam: "#06D7D7",
  seaweed: "#00F4D7",
  sunburn: "#E6AD76",
  gold: "#FAEA5D",
  white: "#FFF",
  black: "#000",
  grey70: "#252525",
  grey50: "#404040",
  grey25: "#7D7D7D",
  grey5: "#A7A7A7",
  grey1: "#E4E4E4",
  indigo2: "#311188",
  indigo3: "#121334",
  indigo4: "#070713",
  seafoam2: "#126969",
  sunset: "#D96A3B",
  sand1: "#E3D899",
  sand2: "#FAF3CE",
  sand3: "#FDFDF8",
  gold2: "#817F48",
  cherry: "#FB5A5A",
  cherry2: "#68282F",
}

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3800d6",
    },
    secondary: {
      main: saddleColors.seaweed,
    },
    background: {
      default: "#ffffe9",
    },
  },

  spacing: 4,
  typography: {
    fontFamily: ['"Source Code Pro"', "monospace"].join(","),
    h3: {
      fontFamily: ['"Noe Display"'].join(","),
    },
    subtitle1: {
      fontSize: 20,
    },
  },
  components: {
    MuiCssBaseline: cssBaseline,
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
  spacing: 4,
  typography: {
    fontFamily: ['"Source Code Pro"', "monospace"].join(","),
    h3: {
      fontFamily: ['"Noe Display"'].join(","),
    },
  },
  components: {
    MuiCssBaseline: cssBaseline,
    MuiAppBar: {
      defaultProps: {
        color: "inherit",
      },
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
