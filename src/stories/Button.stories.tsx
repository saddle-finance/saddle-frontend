import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Button } from "@mui/material"
import React from "react"

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
// Check controls from https://storybook.js.org/docs/react/essentials/controls

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      options: ["contained", "outlined", "text"],
      control: { type: "inline-radio" },
    },
    color: {
      options: ["primary", "secondary", "info", "mute", "error"],
      control: { type: "select" },
    },
    disabled: {
      options: [true, false],
      control: { type: "inline-radio" },
    },
    size: {
      options: ["small", "medium", "large"],
      control: { type: "inline-radio" },
    },
  },
} as ComponentMeta<typeof Button>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />

export const LightButton = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
LightButton.args = {
  variant: "contained",
  children: "Button",
  color: "secondary",
}
