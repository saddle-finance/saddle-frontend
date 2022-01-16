import { PaletteOptions, SimplePaletteColorOptions } from "@mui/material"
import { alpha } from "@mui/material"

// Define custom color types

interface OtherColorTypes {
  divider: string
  border: string
}
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    secondaryLight: SimplePaletteColorOptions
    other: OtherColorTypes
  }
  interface PaletteOptions {
    secondaryLight: SimplePaletteColorOptions
    other: OtherColorTypes
  }
}

const GREY_TONES = {
  100: "#E4E4E4",
  200: "#A7A7A7",
  300: "#7D7D7D",
  500: "#404040",
  700: "#252525",
}
const lightPalette: PaletteOptions | undefined = {
  mode: "light",
  primary: {
    main: "#06D7D7",
    dark: "#037777",
    light: "#83EBEB",
  },
  secondary: {
    main: "#E6AD76",
    dark: "#D07647",
    light: "#FAF3CE",
  },
  secondaryLight: {
    main: "#e3d899",
  },
  info: {
    main: "#4B11F2",
  },
  background: {
    default: "#FFFFE9",
    paper: "#FDFDF8",
  },
  success: {
    main: "#06D7D7",
  },
  warning: {
    main: "#FAEA5D",
    dark: "#817F48",
    light: "#FFEA91",
  },
  error: {
    main: "#FB5A5A",
    dark: "#68282F",
  },
  text: {
    secondary: "#252525",
  },
  other: {
    divider: "#E3D899",
    border: "#7D7D7D",
  },
  grey: GREY_TONES,
}

const darkPalette: PaletteOptions | undefined = {
  mode: "dark",
  primary: {
    main: "#06D7D7",
    dark: "#037777",
    light: "#83EBEB",
  },
  secondary: {
    main: "#E6AD76",
    dark: "#D07647",
    light: "#FAF3CE",
  },
  secondaryLight: {
    main: "#000",
  },
  info: {
    main: "#00f4d7",
  },
  background: {
    default: "#000000",
    paper: alpha("#000000", 0.7),
  },
  other: {
    divider: "#E3D899",
    border: "#7D7D7D",
  },
  grey: GREY_TONES,
}
export default { lightPalette, darkPalette }
