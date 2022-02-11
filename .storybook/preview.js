import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles"
import { ThemeProvider } from "emotion-theming"
import { lightTheme } from "../src/theme"
import componentsOverrides from "../src/theme/components"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const theme = lightTheme
theme.components = componentsOverrides(theme)
export const decorators = [
  (Story) => (
    <MUIThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>{Story()}</ThemeProvider>
    </MUIThemeProvider>
  ),
]
