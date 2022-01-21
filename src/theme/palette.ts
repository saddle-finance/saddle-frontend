import { PaletteOptions, SimplePaletteColorOptions } from "@mui/material"

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
    main: "#FAF3CE",
  },
  info: {
    main: "#4B11F2",
  },
  background: {
    default: "#FFFFE9",
    paper: "#FDFDF8",
  },
  action: {
    hover: "#FAF3CE",
    active: "#FFEA91",
    disabled: "#A7A7A7",
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
  divider: "#E3D899",
  grey: GREY_TONES,
  other: {
    divider: "#E3D899",
    border: "#7D7D7D",
  },
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
    main: "#4B11F2",
    dark: "#2F099F",
    light: "#9B91FF",
  },
  action: {
    hover: "#311188",
    active: "#4B11F2",
    disabled: "#A7A7A7",
    disabledBackground: "#404040",
  },
  success: {
    main: "#06D7D7",
    dark: "#037777",
    light: "#83EBEB",
  },
  error: {
    main: "#FB5A5A",
    dark: "#68282F",
    light: "#FDA49A",
  },
  background: {
    default: "#222461",
    paper: "#121334",
  },
  divider: "#311188",
  other: {
    divider: "#311188",
    border: "#7D7D7D",
  },
  grey: GREY_TONES,
}
export default { lightPalette, darkPalette }
