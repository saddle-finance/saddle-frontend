import { PaletteOptions } from "@mui/material"
import { alpha } from "@mui/material"

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

const GREY = {
  100: "#E4E4E4",
  200: "#A7A7A7",
  300: "#7D7D7D",
  500: "#404040",
  700: "#252525",
}

const lightPalette: PaletteOptions | undefined = {
  mode: "light",
  primary: {
    main: saddleColors.seafoam,
  },
  secondary: {
    main: saddleColors.sunburn,
  },
  background: {
    default: "#FFFFE9",
  },
  grey: GREY,
}

const darkPalette: PaletteOptions | undefined = {
  mode: "dark",
  primary: {
    main: saddleColors.seafoam,
  },
  secondary: {
    main: saddleColors.sunburn,
  },
  background: {
    default: saddleColors.black,
    paper: alpha(saddleColors.black, 0.7),
  },
  grey: GREY,
}
export default { lightTheme: lightPalette, darkTheme: darkPalette }
