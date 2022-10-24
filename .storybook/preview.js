import { Divider, Paper, Typography } from "@mui/material"
import StoryLayout from "./story-layout"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
    <div>
      <StoryLayout>{Story()}</StoryLayout>
    </div>
  ),
]
