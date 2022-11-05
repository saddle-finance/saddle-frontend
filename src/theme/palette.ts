import { PaletteOptions } from "@mui/material"

// Define custom color types

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
    mute: SimplePaletteColorOptions
    other: OtherColorTypes
  }
  interface PaletteOptions {
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
    default: "#FAF3CE",
    paper: "#FDFDF8",
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
}

const darkPalette: PaletteOptions | undefined = {
  mode: "dark",
  primary: {
    main: "#06D7D7",
    dark: "#037777",
    light: "#83EBEB",
    states: {
      outlinedRestingBorder: "#06D7D7",
      outlinedHoverBackground: "#037777",
      containedHoverBackground: "#E6FFFF",
    },
  },
  secondary: {
    main: "#E6AD76",
    dark: "#D07647",
    light: "#FAF3CE",
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
    main: "#FAEA5D",
    dark: "#817F48",
    light: "#FFEA91",
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
