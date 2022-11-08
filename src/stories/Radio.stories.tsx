import { ComponentMeta, ComponentStory } from "@storybook/react"
import { Radio as MuiRadio } from "@mui/material"
import React from "react"

export default {
  title: "Components/Radio",
  component: MuiRadio,
  argTypes: {
    color: {
      options: ["primary", "secondary", "info", "mute", "error"],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof MuiRadio>

const Template: ComponentStory<typeof MuiRadio> = (args) => (
  <MuiRadio {...args} />
)

export const Primary = Template.bind({})
Primary.args = {
  color: "primary",
  checked: true,
}
export const Secondary = Template.bind({})
Secondary.args = {
  color: "secondary",
  checked: true,
}
