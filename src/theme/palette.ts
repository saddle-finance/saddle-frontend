import { OriginColorVariant } from "../types"
import { PaletteOptions } from "@mui/material"

// Define custom color types

function createGradient2(color1: string, color2: string) {
  return `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`
}

// function createGradient3(color1:string,color2:string,color3:string){

// }

type GradientsPaletteOptions = {
  secondL2secondD?: string
  primaryL2primaryD?: string
  primary2secondary?: string
  primaryD2primaryL?: string
  secondaryL2primaryD?: string
  logo?: string
  gold?: string
  mute?: string // This is for button variant. Remove if we don't need mute variant in button.
} & { [K in OriginColorVariant]?: string }

interface OtherColorTypes {
  divider: string
  border: string
}
declare module "@mui/material/styles" {
  interface SimplePaletteColorOptions {
    states?: {
      outlinedRestingBorder?: string
      outlinedHoverBackground?: string
      containedHoverBackground?: string
    }
    alert?: {
      content?: string
      background?: string
    }
  }
  interface PaletteColor {
    states?: {
      outlinedRestingBorder?: string
      outlinedHoverBackground?: string
      containedHoverBackground?: string
    }
    alert?: {
      content?: string
      background?: string
    }
  }
  interface Palette {
    gradient?: GradientsPaletteOptions
    mute: SimplePaletteColorOptions
    other: OtherColorTypes
  }
  interface PaletteOptions {
    gradient?: GradientsPaletteOptions
    mute: SimplePaletteColorOptions
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
    states: {
      outlinedRestingBorder: "#06D7D7",
      outlinedHoverBackground: "#E6FFFF",
      containedHoverBackground: "#037777",
    },
  },
  secondary: {
    main: "#E6AD76",
    dark: "#D07647",
    light: "#FAF3CE",
    states: {
      outlinedRestingBorder: "#E6AD76",
      outlinedHoverBackground: "#FAF3CE",
      containedHoverBackground: "#D07647",
    },
  },
  mute: {
    main: "#FAF3CE",
    light: "#FAF3CE",
    dark: "#E3D899",
    states: {
      containedHoverBackground: "#E3D899",
    },
  },
  info: {
    main: "#4B11F2",
    states: {
      outlinedRestingBorder: "#4B11F2",
      outlinedHoverBackground: "#C9B8FB",
      containedHoverBackground: "#2F099F",
    },
    alert: {
      background: "#C9B8FB",
    },
  },
  background: {
    default: "#FFFFFF",
    paper: "#EAEAEA",
  },
  action: {
    hover: "#FAF3CE",
    hoverOpacity: 0.1,
    active: "#FFEA91",
    disabled: "#A7A7A7",
  },
  success: {
    main: "#06D7D7",
    dark: "#037777",
    light: "#83EBEB",
    alert: {
      background: "#E6FFFF",
    },
  },
  error: {
    main: "#FB5A5A",
    dark: "#68282F",
    light: "#FDA49A",
    alert: {
      background: "#FEECEB",
    },
  },
  warning: {
    main: "#FAEA5D",
    dark: "#817F48",
    light: "#FFEA91",
    alert: {
      content: "#000000",
      background: "#FFF3C8",
    },
  },
  text: {
    primary: "#000000",
    secondary: "#404040",
    disabled: "#A7A7A7",
  },
  divider: "#E3D899",
  grey: GREY_TONES,
  other: {
    divider: "#E3D899",
    border: "#7D7D7D",
  },
  gradient: {
    primary2secondary: createGradient2("#474799", "#47998F"),
    primary: createGradient2("#7272BA", "#474799"),
  },
}

const darkPalette: PaletteOptions | undefined = {
  mode: "dark",
  primary: {
    main: "#474799",
    dark: "#363681",
    light: "#7272BA",
    states: {
      outlinedRestingBorder: "#06D7D7",
      outlinedHoverBackground: "#037777",
      containedHoverBackground: "#E6FFFF",
    },
  },
  secondary: {
    main: "#47998F",
    dark: "#337F77",
    light: "#78C4BB",
    states: {
      outlinedRestingBorder: "#E6AD76",
      outlinedHoverBackground: "#D07647",
      containedHoverBackground: "#FAF3CE",
    },
  },
  mute: {
    main: "#311188",
    light: "#4B11F2",
    dark: "#200B5B",
    states: {
      containedHoverBackground: "#4B11F2",
    },
  },
  info: {
    main: "#4B11F2",
    dark: "#2F099F",
    light: "#9B91FF",
    states: {
      outlinedRestingBorder: "#4B11F2",
      outlinedHoverBackground: "#270782",
      containedHoverBackground: "#C9B8FB",
    },
  },

  action: {
    hover: "#311188",
    active: "#4B11F2",
    disabled: "#A7A7A7",
    disabledBackground: "#404040",
    hoverOpacity: 0.5,
    selected: "#4B11F2",
  },
  success: {
    main: "#06D7D7",
    dark: "#037777",
    light: "#83EBEB",
    alert: {
      background: "#E6FFFF",
    },
  },
  error: {
    main: "#FB5A5A",
    dark: "#68282F",
    light: "#FDA49A",
    alert: {
      background: "#FEECEB",
    },
  },
  warning: {
    main: "#EDA554",
    dark: "#EA943D",
    light: "#F2C795",
    alert: {
      content: "#000000",
      background: "#FFF3C8",
    },
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#E4E4E4",
    disabled: "#7D7D7D",
  },
  background: {
    default: "#181818",
    paper: "#303030",
  },
  divider: "#7272BA",
  other: {
    divider: "#7272BA",
    border: "#7D7D7D",
  },
  grey: GREY_TONES,
  gradient: {
    primary: createGradient2("#7272BA", "#474799"),
    secondary: createGradient2("#78C4BB", "#47998F"),
  },
}
export default { lightPalette, darkPalette }
