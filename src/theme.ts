import { createTheme } from "@mui/material"

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
      main: saddleColors.seaweed,
    },
    secondary: {
      main: "#3800d6",
    },
    background: {
      default: "#ffffff",
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
          backgroundColor: "#ffffff",
          color: "#141414",
          boxShadow: "transparent",
          borderColor: "transparent",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #000000",
          boxShadow: "none",
          opacity: 1,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },

    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        paper: {
          borderRadius: 10,
          borderColor: "transparent",
        },
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
        root: {
          borderColor: "transparent",
          backgroundColor: "#000",
          color: "#fff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderColor: saddleColors.grey50,
          borderWidth: 1,
          borderStyle: "solid",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        paper: {
          borderRadius: 10,
          backgroundColor: saddleColors.indigo4,
          backgroundImage: "none",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.7)",
        },
      },
    },
  },
})
