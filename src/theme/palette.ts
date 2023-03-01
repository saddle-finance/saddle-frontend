import { OriginColorVariant } from "../types"
import { PaletteOptions } from "@mui/material"

// Define custom color types

export function createGradient2(color1?: string, color2?: string) {
  if (color1 && color2)
    return `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`
}

type GradientsPaletteOptions = {
  primaryLight?: string
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
    main: "#474799",
    dark: "#363681",
    light: "#7272BA",
  },
  secondary: {
    main: "#47998F",
    dark: "#337F77",
    light: "#78C4BB",
  },
  mute: {
    main: "#FAF3CE",
    light: "#FAF3CE",
    dark: "#E3D899",
  },
  info: {
    main: "#474799",
    alert: {
      background: "#C9B8FB",
    },
  },
  background: {
    default: "#FFFFFF",
    paper: "#EAEAEA",
  },
  action: {
    hover: "rgba(0, 0, 0, 0.1)",
    active: "#474799",
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
    light: "#F2C795",
    alert: {
      background: "#FEECEB",
    },
  },
  warning: {
    main: "#EDA554",
    dark: "#EA943D",
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
  divider: "#474799",
  grey: GREY_TONES,
  other: {
    divider: "#474799",
    border: "#7D7D7D",
  },
  gradient: {
    primary: createGradient2("#7272BA", "#474799"),
    secondary: createGradient2("#78C4BB", "#47998F"),
  },
}

const darkPalette: PaletteOptions | undefined = {
  mode: "dark",
  primary: {
    main: "#474799",
    dark: "#363681",
    light: "#7272BA",
  },
  secondary: {
    main: "#47998F",
    dark: "#337F77",
    light: "#78C4BB",
  },
  mute: {
    main: "#311188",
    light: "#4B11F2",
    dark: "#200B5B",
  },
  info: {
    main: "#4B11F2",
    dark: "#2F099F",
    light: "#9B91FF",
  },

  action: {
    hover: "rgba(0, 0, 0, 0.2)",
    active: "#474799",
    disabled: "#A7A7A7",
    disabledBackground: "#404040",
    hoverOpacity: 0.5,
    selected: "#474799",
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
    border: "#474799",
  },
  grey: GREY_TONES,
  gradient: {
    primary: createGradient2("#7272BA", "#474799"),
    secondary: createGradient2("#78C4BB", "#47998F"),
  },
}
export default { lightPalette, darkPalette }
