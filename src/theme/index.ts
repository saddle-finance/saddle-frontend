import { ThemeConfig, extendTheme } from "@chakra-ui/react"

import components from "./components/index"

// import components from "./components"

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
}

const colors = {
  red: {
    50: "#ffe3e3",
    100: "#ffb2b3",
    200: "#fd8282",
    300: "#fb5151",
    400: "#f92120",
    500: "#df0a06", // base
    600: "#ae0404",
    700: "#7d0102",
    800: "#4d0000",
    900: "#1f0000",
  },
  teal: {
    50: "#d7fffe",
    100: "#abfff7",
    200: "#7afff0",
    300: "#48ffea",
    400: "#1affe4",
    500: "#00e6ca", // base
    600: "#00b39d",
    700: "#008170",
    800: "#004e43",
    900: "#001c16",
  },
  purple: {
    50: "#f4e3ff",
    100: "#d5b2ff",
    200: "#b87fff",
    300: "#9b4cff",
    400: "#7e1aff",
    500: "#6500e6", // base
    600: "#4e00b4",
    700: "#380082",
    800: "#220050",
    900: "#0d0020",
  },
  gold: {
    50: "#fff6e1",
    100: "#fbe5b7",
    200: "#f7d38a",
    300: "#f4c25c",
    400: "#f1b030",
    500: "#d7971b", // base
    600: "#a77513",
    700: "#77540c",
    800: "#483204",
    900: "#1a1100",
  },
}

const fonts = {
  body: "Source Code Pro, monospace, sans-serif",
  heading: "Noe Display, Times, serif",
  mono: "Source Code Pro, monospace, sans-serif",
}

const overrides = { config, colors, fonts, components }

export default extendTheme(overrides)
