import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Box } from "@mui/material"
import React from "react"

export default {
  title: "Theme/Pallet",
  component: Box,
} as ComponentMeta<typeof Box>

const Template: ComponentStory<typeof Box> = () => (
  <div style={{ display: "flex", gap: 10 }}>
    <Box
      height={300}
      width={300}
      sx={(theme) => ({
        background: theme.palette.gradient?.primary,
      })}
    >
      box
    </Box>
    <Box
      height={300}
      width={300}
      sx={(theme) => ({
        background: theme.palette.gradient?.primary,
      })}
    >
      box
    </Box>
    <Box
      height={300}
      width={300}
      sx={(theme) => ({
        background: theme.palette.gradient?.logo,
      })}
    >
      box
    </Box>
  </div>
)
export const Palette = Template.bind({})
