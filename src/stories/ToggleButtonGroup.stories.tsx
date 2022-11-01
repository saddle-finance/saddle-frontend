import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import React from "react"

export default {
  title: "Components/ToggleButtonGroup",
  component: ToggleButtonGroup,
  argTypes: {
    color: {
      options: ["primary", "secondary", "mute", "info"],
      control: { type: "inline-radio" },
    },
  },
} as ComponentMeta<typeof ToggleButtonGroup>

const Template: ComponentStory<typeof ToggleButtonGroup> = (arg) => (
  <ToggleButtonGroup {...arg} value="btc">
    <ToggleButton value="btc">BTC</ToggleButton>
    <ToggleButton value="eth">ETH</ToggleButton>
    <ToggleButton value="others">Others</ToggleButton>
  </ToggleButtonGroup>
)

export const LightToggleButtonGroup = Template.bind({})

LightToggleButtonGroup.args = {
  color: "secondary",
}
