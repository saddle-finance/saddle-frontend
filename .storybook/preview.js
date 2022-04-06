import { Container, Typography, Divider, Paper, Box } from "@mui/material"
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles"
import { ThemeProvider } from "emotion-theming"
import { lightTheme, darkTheme } from "../src/theme"
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

const muiLightTheme = lightTheme
muiLightTheme.components = componentsOverrides(muiLightTheme)
const muiDarkTheme = darkTheme
muiDarkTheme.components = componentsOverrides(muiDarkTheme)
export const decorators = [
  (Story) => (
    <div>
      <Typography>Light theme</Typography>
      <MUIThemeProvider theme={muiLightTheme}>
        <ThemeProvider theme={muiLightTheme}>
          <Container>
            <Paper>
              <Box p={5}>{Story()}</Box>
            </Paper>
          </Container>
        </ThemeProvider>
      </MUIThemeProvider>
      <Divider sx={{ mt: 4 }} />
      <Typography>Dark theme</Typography>
      <MUIThemeProvider theme={muiDarkTheme}>
        <ThemeProvider theme={muiDarkTheme}>
          <Container>
            <Paper>
              <Box p={5}>{Story()}</Box>
            </Paper>
          </Container>
        </ThemeProvider>
      </MUIThemeProvider>
    </div>
  ),
]
